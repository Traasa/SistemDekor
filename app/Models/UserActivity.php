<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserActivity extends Model
{
    protected $fillable = [
        'user_id',
        'activity_type',
        'description',
        'subject_type',
        'subject_id',
        'properties',
        'ip_address',
        'user_agent',
        'method',
        'url',
    ];

    protected $casts = [
        'properties' => 'array',
        'created_at' => 'datetime',
    ];

    /**
     * Get the user that performed the activity
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the subject model (polymorphic)
     */
    public function subject()
    {
        if ($this->subject_type && $this->subject_id) {
            return $this->subject_type::find($this->subject_id);
        }
        return null;
    }

    /**
     * Log activity helper method
     */
    public static function log(
        string $activityType,
        string $description,
        ?string $subjectType = null,
        ?int $subjectId = null,
        ?array $properties = null
    ): self {
        return self::create([
            'user_id' => auth()->id(),
            'activity_type' => $activityType,
            'description' => $description,
            'subject_type' => $subjectType,
            'subject_id' => $subjectId,
            'properties' => $properties,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'method' => request()->method(),
            'url' => request()->fullUrl(),
        ]);
    }

    /**
     * Get activity icon based on type
     */
    public function getIconAttribute(): string
    {
        return match($this->activity_type) {
            'login' => '🔓',
            'logout' => '🔒',
            'create' => '➕',
            'update' => '✏️',
            'delete' => '🗑️',
            'view' => '👁️',
            'upload' => '📤',
            'download' => '📥',
            'verify' => '✅',
            'reject' => '❌',
            default => '📋',
        };
    }

    /**
     * Get activity color based on type
     */
    public function getColorAttribute(): string
    {
        return match($this->activity_type) {
            'login' => 'green',
            'logout' => 'gray',
            'create' => 'blue',
            'update' => 'yellow',
            'delete' => 'red',
            'view' => 'purple',
            'upload' => 'indigo',
            'download' => 'cyan',
            'verify' => 'green',
            'reject' => 'red',
            default => 'gray',
        };
    }
}
