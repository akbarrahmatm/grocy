<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'user_id', 'order_number', 'status',
    'shipping_name', 'shipping_phone', 'shipping_address', 'shipping_city',
    'shipping_postal_code', 'shipping_latitude', 'shipping_longitude',
    'subtotal', 'shipping_cost', 'total',
    'snap_token', 'snap_redirect_url', 'transaction_id', 'paid_at', 'note',
])]
class Order extends Model
{
    use HasFactory;

    protected $casts = [
        'subtotal' => 'decimal:2',
        'shipping_cost' => 'decimal:2',
        'total' => 'decimal:2',
        'paid_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }
}