<?php

namespace App\Http\Controllers;

use App\Models\Status;
use Illuminate\Http\JsonResponse;

class StatusController extends Controller
{
    public function index():JsonResponse
    {
        return response()->json([
            'statuses' => Status::orderBy('name')->get()
        ]);
    }
}
