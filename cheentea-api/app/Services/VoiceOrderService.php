<?php

namespace App\Services;

use App\Models\Product;
use App\Models\Category;
use App\Models\ModifierGroup;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class VoiceOrderService
{
    /**
     * Process a voice transcript and return structured cart items.
     */
    public function processTranscript(string $transcript): array
    {
        $menu = $this->buildMenuContext();
        $systemPrompt = $this->buildSystemPrompt($menu);

        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . config('services.openai.api_key'),
            'Content-Type' => 'application/json',
        ])->timeout(30)->post('https://api.openai.com/v1/chat/completions', [
            'model' => config('services.openai.model', 'gpt-4o-mini'),
            'max_tokens' => 1024,
            'temperature' => 0.1,
            'messages' => [
                ['role' => 'system', 'content' => $systemPrompt],
                ['role' => 'user', 'content' => $transcript],
            ],
        ]);

        if (!$response->successful()) {
            Log::error('OpenAI API error', [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);
            throw new \RuntimeException('Failed to process voice order');
        }

        $body = $response->json();
        $text = $body['choices'][0]['message']['content'] ?? '';

        return $this->parseResponse($text, $menu);
    }

    /**
     * Build the full menu context for the LLM.
     */
    private function buildMenuContext(): array
    {
        $categories = Category::with(['products' => function ($q) {
            $q->where('is_active', true)->with(['sizes', 'modifierGroups.modifiers']);
        }])->get();

        $menu = [];
        foreach ($categories as $category) {
            $categoryData = [
                'category_id' => $category->id,
                'category_name' => $category->name,
                'products' => [],
            ];

            foreach ($category->products as $product) {
                $productData = [
                    'product_id' => $product->id,
                    'name' => $product->name,
                    'description' => $product->description,
                    'sizes' => [],
                    'modifier_groups' => [],
                ];

                foreach ($product->sizes as $size) {
                    $productData['sizes'][] = [
                        'size_id' => $size->id,
                        'size' => $size->size,
                        'price' => (float) $size->price,
                    ];
                }

                foreach ($product->modifierGroups as $group) {
                    $groupData = [
                        'group_id' => $group->id,
                        'name' => $group->name,
                        'is_required' => (bool) $group->is_required,
                        'max_selections' => $group->max_selections,
                        'modifiers' => [],
                    ];

                    foreach ($group->modifiers as $modifier) {
                        if ($modifier->is_active) {
                            $groupData['modifiers'][] = [
                                'modifier_id' => $modifier->id,
                                'name' => $modifier->name,
                                'price_adjustment' => (float) $modifier->price_adjustment,
                            ];
                        }
                    }

                    $productData['modifier_groups'][] = $groupData;
                }

                $categoryData['products'][] = $productData;
            }

            if (count($categoryData['products']) > 0) {
                $menu[] = $categoryData;
            }
        }

        return $menu;
    }

    /**
     * Build the system prompt with menu data.
     */
    private function buildSystemPrompt(array $menu): string
    {
        $menuJson = json_encode($menu, JSON_PRETTY_PRINT);

        return <<<PROMPT
You are a voice order assistant for CheenTea, a milk tea and bubble tea kiosk in the Philippines. Your job is to interpret customer voice orders and convert them into structured JSON that maps to our menu. Customers may speak in English, Tagalog/Filipino, Bisaya/Cebuano, or Taglish (mixed). Understand all of these languages. For example: "dalawang taro milk tea" = 2 Taro Milk Tea, "usa ka matcha latte" = 1 Matcha Latte, "less sugar" = "konting asukal" = less sugar modifier.

Here is our current menu:
{$menuJson}

INSTRUCTIONS:
1. Match what the customer says to products in the menu. Use fuzzy matching — "taro milk tea" matches "Taro Milk Tea", "matcha" matches "Matcha Latte", etc.
2. For each item, pick the best matching product_id, product_size_id, quantity, and modifier_ids.
3. If the customer doesn't specify a size, default to Medium (M). If no M exists, use the first available size.
4. If the customer doesn't specify sugar or ice level, do NOT include sugar/ice modifiers (the frontend will use defaults).
5. If the customer mentions sugar level (e.g., "less sugar", "no sugar", "50% sugar"), find the matching modifier from the Sugar Level group.
6. If the customer mentions ice level (e.g., "less ice", "no ice", "extra ice"), find the matching modifier from the Ice Level group.
7. If the customer mentions toppings (e.g., "with boba", "add pearls", "extra pudding"), find the matching modifiers.
8. If a product is not found on the menu, include it in the "not_found" array with what the customer said.
9. Default quantity is 1 unless the customer specifies otherwise (e.g., "two taro milk teas" = quantity 2).

RESPOND WITH ONLY valid JSON in this exact format, no other text:
{
  "items": [
    {
      "product_id": 1,
      "product_name": "Taro Milk Tea",
      "product_size_id": 5,
      "size_name": "M",
      "quantity": 1,
      "modifier_ids": [10, 11],
      "modifier_names": ["50% Sugar", "Less Ice"],
      "unit_price": 80,
      "notes": "any interpretation notes"
    }
  ],
  "not_found": ["item that wasn't on the menu"],
  "message": "A friendly summary of what you understood in the same language the customer used. E.g. English: 'Got it! 1 Taro Milk Tea (Medium) with 50% sugar and less ice.' Tagalog: 'Sige po! 1 Taro Milk Tea (Medium) na may 50% sugar at less ice.' Bisaya: 'Sige! 1 Taro Milk Tea (Medium) with 50% sugar ug less ice.'"
}
PROMPT;
    }

    /**
     * Parse the LLM response text into structured data.
     */
    private function parseResponse(string $text, array $menu): array
    {
        // Extract JSON from the response (handle markdown code blocks)
        $text = trim($text);
        if (preg_match('/```(?:json)?\s*([\s\S]*?)```/', $text, $matches)) {
            $text = trim($matches[1]);
        }

        $parsed = json_decode($text, true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            Log::error('Failed to parse LLM response', ['text' => $text]);
            throw new \RuntimeException('Could not understand the order. Please try again.');
        }

        // Validate and enrich items with full product data
        $validatedItems = [];
        $productIndex = $this->buildProductIndex($menu);

        foreach ($parsed['items'] ?? [] as $item) {
            $productId = $item['product_id'] ?? null;
            if (!$productId || !isset($productIndex[$productId])) {
                continue;
            }

            $product = $productIndex[$productId];

            // Validate size exists
            $sizeId = $item['product_size_id'] ?? null;
            $validSize = false;
            foreach ($product['sizes'] as $size) {
                if ($size['size_id'] === $sizeId) {
                    $validSize = true;
                    break;
                }
            }
            if (!$validSize && !empty($product['sizes'])) {
                $sizeId = $product['sizes'][0]['size_id'];
            }

            // Validate modifier_ids exist for this product
            $validModifierIds = $this->getValidModifierIds($product);
            $modifierIds = array_values(array_intersect(
                $item['modifier_ids'] ?? [],
                $validModifierIds
            ));

            $validatedItems[] = [
                'product_id' => $productId,
                'product_name' => $item['product_name'] ?? $product['name'],
                'product_size_id' => $sizeId,
                'size_name' => $item['size_name'] ?? '',
                'quantity' => max(1, (int) ($item['quantity'] ?? 1)),
                'modifier_ids' => $modifierIds,
                'modifier_names' => $item['modifier_names'] ?? [],
                'unit_price' => $item['unit_price'] ?? 0,
                'notes' => $item['notes'] ?? '',
            ];
        }

        return [
            'items' => $validatedItems,
            'not_found' => $parsed['not_found'] ?? [],
            'message' => $parsed['message'] ?? 'Order processed.',
        ];
    }

    /**
     * Build a product lookup index from menu data.
     */
    private function buildProductIndex(array $menu): array
    {
        $index = [];
        foreach ($menu as $category) {
            foreach ($category['products'] as $product) {
                $index[$product['product_id']] = $product;
            }
        }
        return $index;
    }

    /**
     * Get all valid modifier IDs for a product.
     */
    private function getValidModifierIds(array $product): array
    {
        $ids = [];
        foreach ($product['modifier_groups'] as $group) {
            foreach ($group['modifiers'] as $modifier) {
                $ids[] = $modifier['modifier_id'];
            }
        }
        return $ids;
    }
}
