<?php

return [
    'secret' => env('JWT_SECRET'),

    // token lifetime (minutes)
    'ttl' => env('JWT_TTL', 60),

    // refresh token lifetime (minutes)
    'refresh_ttl' => env('JWT_REFRESH_TTL', 20160),

    // HMAC algo
    'algo' => env('JWT_ALGO', 'HS256'),

    // only used if you switch to RSA/ECDSA
    'keys' => [
        'public' => env('JWT_PUBLIC_KEY'),
        'private' => env('JWT_PRIVATE_KEY'),
        'passphrase' => env('JWT_PASSPHRASE'),
    ],
];
