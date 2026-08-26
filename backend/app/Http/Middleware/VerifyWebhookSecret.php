<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Response;

class VerifyWebhookSecret
{
    public function handle(Request $request, Closure $next): Response
    {
        $expected = config('services.webhook.secret');

        if (! is_string($expected) || $expected === '') {
            abort(404);
        }

        $provided = $request->header('X-Webhook-Secret');

        if ($provided === null) {
            $provided = Str::after($request->header('Authorization', ''), 'Bearer ');
        }

        if (! is_string($provided) || $provided === '' || ! hash_equals($expected, $provided)) {
            return response()->json(['message' => 'Unauthorized.'], 401);
        }

        return $next($request);
    }
}
