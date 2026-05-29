<?php

namespace App\Http\Controllers;

use App\Models\Status;
use Illuminate\Http\JsonResponse;

/** Catálogo de estados posibles de un evento. */
class StatusController extends Controller
{
    /** Devuelve todos los estados ordenados por nombre. */
    public function index():JsonResponse
    {
        return response()->json([
            'statuses' => Status::orderBy('name')->get()
        ]);
    }
}
