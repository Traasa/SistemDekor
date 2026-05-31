<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class VendorClient extends Model
{
    protected $fillable = [
        'name',
        'company_name',
        'email',
        'phone',
        'address',
    ];

    /**
     * Get mini orders for this vendor client.
     */
    public function miniOrders(): HasMany
    {
        return $this->hasMany(MiniOrder::class);
    }
}
