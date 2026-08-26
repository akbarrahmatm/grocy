<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RecipeHistory extends Model
{
    protected $fillable = [
        'user_id',
        'dish',
        'total_items',
        'available_items',
        'unavailable_items',
        'additional_items',
        'recipe',
    ];

    protected $casts = [
        'available_items' => 'array',
        'unavailable_items' => 'array',
        'additional_items' => 'array',
        'recipe' => 'array',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
