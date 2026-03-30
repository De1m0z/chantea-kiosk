<?php

namespace App\Http\Controllers;

use App\Services\VoiceOrderService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class VoiceOrderController extends Controller
{
    public function __construct(
        private VoiceOrderService $voiceOrderService
    ) {}

    /**
     * Process a voice order transcript and return structured cart items.
     */
    public function process(Request $request): JsonResponse
    {
        $request->validate([
            'transcript' => 'required|string|max:2000',
        ]);

        try {
            $result = $this->voiceOrderService->processTranscript($request->input('transcript'));

            return $this->successResponse($result, 'Voice order processed successfully');
        } catch (\RuntimeException $e) {
            return $this->errorResponse($e->getMessage(), 422);
        } catch (\Exception $e) {
            Log::error('Voice order processing failed', [
                'error' => $e->getMessage(),
                'transcript' => $request->input('transcript'),
            ]);
            return $this->errorResponse('Failed to process voice order. Please try again.', 500);
        }
    }
}
