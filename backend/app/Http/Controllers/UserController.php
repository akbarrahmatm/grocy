<?php

namespace App\Http\Controllers;

use App\Http\Requests\UserStoreRequest;
use App\Services\UserService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function __construct(private readonly UserService $users) {}

    public function index(Request $request): JsonResponse
    {
        if ($request->user()->is_customer) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $role = $request->query('role');
        if ($role !== null && ! in_array($role, ['admin', 'customer'], true)) {
            return response()->json([
                'message' => 'Invalid role filter.',
                'errors' => ['role' => ['Role must be admin or customer.']],
            ], 422);
        }

        $search = $request->query('search');
        if ($search !== null && (strlen($search) > 100)) {
            return response()->json([
                'message' => 'Invalid search.',
                'errors' => ['search' => ['Search must be 100 characters or fewer.']],
            ], 422);
        }

        return response()->json($this->users->listUsers($role, $search ?: null));
    }

    public function store(UserStoreRequest $request): JsonResponse
    {
        return response()->json($this->users->createUser($request->validated()), 201);
    }
}
