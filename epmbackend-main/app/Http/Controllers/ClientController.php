<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Client;
use App\Http\Helpers\ApiResponse;
use App\Http\Resources\ClientResource;
use Illuminate\Support\Facades\Validator;

class ClientController extends Controller
{
   public function index()
	{
		$clients = Client::select('id', 'name', 'client_type', 'contact_detail', 'hire_on_id', 'company_name', 'company_address','project_type','communication','created_at', 'updated_at')->orderBy('id','DESC')->get();
		return ApiResponse::success('Clients fetched successfully', ClientResource::collection($clients));
	}


public function store(Request $request)
{
    $rules = [
        'client_type'     => 'required|string|max:255',
        'name'            => 'required|string|max:255|unique:clients,name',
        'contact_detail' => 'required|digits_between:10,15|unique:clients,contact_detail',
        'project_type'    => 'nullable|string|in:fixed,hourly',
        'communication'   => 'required|string',
        // 'hire_on_id'      => 'nullable|string|max:255|unique:clients,hire_on_id',
        'hire_on_id'      => 'nullable|string|max:255',
        // 'company_name'    => 'nullable|string|max:255|unique:clients,company_name',
        'company_name' => 'required_unless:client_type,Hired on Upwork|string|max:255|unique:clients,company_name',
        'company_address' => 'nullable|string|max:255',
    ];

    $messages = [
        'name.unique'            => 'A client with this name already exists.',
        'contact_detail.unique'  => 'This contact detail is already in use.',
        'hire_on_id.unique'      => 'This Hire-on ID is already associated with another client.',
        'company_name.unique'    => 'This company name is already used by another client.',
        'client_type.required'   => 'Client type is required.',
        'company_name.required_unless' => 'Company name is required for non-Upwork clients.',
    ];

    $validator = Validator::make($request->all(), $rules, $messages);

    if ($validator->fails()) {
        return response()->json([
            'success' => false,
            'errors'  => $validator->errors(),
        ], 422);
    }

    $validated = $validator->validated();

    if ($validated['client_type'] !== 'Hired on Upwork' && empty($validated['company_name'])) {
        return response()->json([
            'success' => false,
            'errors' => [
                'company_name' => ['Company name is required for non-Upwork clients.'],
            ],
        ], 422);
    }

    $client = Client::create($validated);

    return response()->json([
        'success' => true,
        'message' => 'Client created successfully',
        'data'    => $client,
    ]);
}

public function update(Request $request, $id)
{
    $client = Client::find($id);

    if (!$client) {
        return response()->json([
            'success' => false,
            'message' => 'Client not found'
        ], 404);
    }

    // Base validation rules
    $rules = [
        'client_type'     => 'required|string|max:255',
        'name'            => 'required|string|max:255|unique:clients,name,' . $id,
        'contact_detail'  => 'nullable|string|max:255|unique:clients,contact_detail,' . $id,
        'project_type'    => 'nullable|string|in:fixed,hourly',
        'communication'   => 'nullable|string',
        'hire_on_id'      => 'nullable|string|max:255|unique:clients,hire_on_id,' . $id,
        'company_name'    => 'nullable|string|max:255|unique:clients,company_name,' . $id,
        'company_address' => 'nullable|string|max:255',
    ];

    // Custom messages (optional)
    $messages = [
        'name.unique'            => 'A client with this name already exists.',
        'contact_detail.unique'  => 'This contact detail is already in use.',
        'hire_on_id.unique'      => 'This Hire-on ID is already associated with another client.',
        'company_name.unique'    => 'This company name is already used by another client.',
        'client_type.required'   => 'Client type is required.',
    ];

    // Validate request
    $validated = $request->validate($rules, $messages);

    // Conditional requirement: company_name is required if not Upwork
    if ($validated['client_type'] !== 'Hired on Upwork' && empty($validated['company_name'])) {
        return response()->json([
            'success' => false,
            'message' => 'Company name is required for non-Upwork clients.',
        ], 422);
    }

    // Update client
    $client->update($validated);

    return response()->json([
        'success' => true,
        'message' => 'Client updated successfully',
        'data'    => $client
    ]);
}

    public function destroy($id)
    {
        $client = Client::find($id);

        if (!$client) {
            return ApiResponse::error('Client not found', [], 404);
        }

        $client->delete();
        return ApiResponse::success('Client deleted successfully');
    }

}
