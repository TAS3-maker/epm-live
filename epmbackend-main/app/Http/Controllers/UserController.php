<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Team;
use App\Models\PerformaSheet;
use App\Models\Project;
use App\Models\Role;
use App\Http\Resources\UserResource;
use App\Http\Helpers\ApiResponse;
use App\Mail\SendEmployeeCredentials;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class UserController extends Controller
{
   public function store(Request $request)
    {
        try {
            $validatedData = $request->validate([
                'name' => 'required|string|max:255',
                'email' => 'required|email|unique:users',
                'password' => 'required|min:6',
                'team_id' => 'nullable|exists:teams,id',
                'phone_num' => 'required|string|min:10|max:15|unique:users,phone_num',
                'emergency_phone_num' => 'nullable|string|min:10|max:15|unique:users,emergency_phone_num',
                'address' => 'nullable|string',
                'role_id' => 'required|exists:roles,id',
                'profile_pic' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
                // 'profile_pic_name' => 'nullable|string' // This field might not be needed if you're sending the file directly
            ]);

            $user = User::create([
                'name' => $validatedData['name'],
                'email' => $validatedData['email'],
                'address' => $validatedData['address'] ?? null,
                'phone_num' => $validatedData['phone_num'] ?? null,
                'emergency_phone_num' => $validatedData['emergency_phone_num'] ?? null,
                'password' => Hash::make($validatedData['password']),
                'team_id' => $validatedData['team_id'] ?? null,
                'role_id' => $validatedData['role_id'],
            ]);

            if ($request->hasFile('profile_pic')) {
                $file = $request->file('profile_pic');
                $filename = time() . '.' . $file->getClientOriginalExtension();
                Storage::disk('public')->putFileAs('profile_pics', $file, $filename);
                $user->profile_pic = $filename;
                $user->save();
            }

            $roleName = Role::find($validatedData['role_id'])->name ?? null;
            $teamName = null;
            if (!empty($validatedData['team_id'])) {
                $teamName = Team::find($validatedData['team_id'])->name ?? null;
            }

            // Important: Handle potential mail sending failures
            try {
                Mail::to($validatedData['email'])->send(new SendEmployeeCredentials(
                    $validatedData['email'],
                    $request->password, // password not hashed here because you send original password
                    $roleName,
                    $teamName
                ));
            } catch (\Exception $mailException) {
                // Log the mail error, but don't prevent user creation from succeeding
                \Log::error('Mail sending failed for user: ' . $validatedData['email'] . ' - ' . $mailException->getMessage());
                // You might want to return an error about mail, but still success for user creation
                // Or if mail is critical, consider rolling back user creation or using a queue
            }


            return ApiResponse::success('User created successfully', new UserResource($user), 201);

        } catch (ValidationException $e) {
            // Laravel automatically handles this if Accept: application/json header is present
            // However, explicitly returning it ensures consistency and might help debugging.
            return ApiResponse::error('Validation failed', $e->errors(), 422);
        } catch (\Exception $e) {
            // Catch any other unexpected errors and return a JSON error response
            \log::error('Error creating user: ' . $e->getMessage() . ' in ' . $e->getFile() . ' on line ' . $e->getLine());
            return ApiResponse::error('An unexpected error occurred.', ['general' => $e->getMessage()], 500);
        }
    }

    public function index()
    {
        $users = User::with(['team', 'role'])->get();
        return ApiResponse::success('Users fetched successfully', UserResource::collection($users));
    }

    public function projectManger()
    {
        $users = User::where('role_id',5)->get();
        return ApiResponse::success('Project Manger fetched successfully', UserResource::collection($users));
    }

    public function show($id)
    {
        $user = User::with(['team', 'role'])->find($id);

        if (!$user) {
            return ApiResponse::error('User not found', [], 404);
        }

        return ApiResponse::success('User details fetched successfully', new UserResource($user));
    }

    public function destroy($id)
    {
        $user = User::find($id);

        if (!$user) {
            return ApiResponse::error('User not found', [], 404);
        }

        // Correct the file path
        $imagePath = 'profile_pics/' . $user->profile_pic;

        if ($user->profile_pic && Storage::disk('public')->exists($imagePath)) {
            Storage::disk('public')->delete($imagePath);
        }

        $user->delete();

        return ApiResponse::success('User deleted successfully');
    }

    public function update(Request $request, $id)
    {
        $user = User::find($id);

        if (!$user) {
            return ApiResponse::error('User not found', [], 404);
        }

        try {
            $validatedData = $request->validate([
                'name' => 'sometimes|string|max:255',
                'email' => 'sometimes|email|unique:users,email,' . $id, // Ignore current user's ID
                'phone_num' => 'nullable|string|min:10|max:15|unique:users,phone_num,' . $id, // Add unique back
                'emergency_phone_num' => 'nullable|string|min:10|max:15|unique:users,emergency_phone_num,' . $id, // Add unique back
                'address' => 'nullable|string',
                'team_id' => 'nullable|exists:teams,id',
                // Assuming role_id is a single foreign key on the users table
                'role_id' => 'nullable|exists:roles,id',
                'profile_pic' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
                // Add password validation if you want to allow password updates
                'password' => 'sometimes|min:6|confirmed', // 'confirmed' requires password_confirmation field
            ]);
        } catch (ValidationException $e) {
            // This is correctly returning JSON validation errors
            return ApiResponse::error('Validation Error', $e->errors(), 422);
        }

        // Update basic user fields
        $user->name = $validatedData['name'] ?? $user->name;
        $user->email = $validatedData['email'] ?? $user->email;
        $user->phone_num = $validatedData['phone_num'] ?? $user->phone_num;
        $user->emergency_phone_num = $validatedData['emergency_phone_num'] ?? $user->emergency_phone_num;
        $user->address = $validatedData['address'] ?? $user->address;
        $user->team_id = $validatedData['team_id'] ?? $user->team_id; // Allows setting to null if nullable
        $user->role_id = $validatedData['role_id'] ?? $user->role_id; // Allows setting to null if nullable

        // Handle password update separately as it needs hashing
        if (isset($validatedData['password'])) {
            $user->password = Hash::make($validatedData['password']);
        }

        $user->save(); // Save the changes to non-file fields

        if ($request->hasFile('profile_pic')) {
            // Delete old image if exists
            if ($user->profile_pic && Storage::disk('public')->exists('profile_pics/' . $user->profile_pic)) {
                Storage::disk('public')->delete('profile_pics/' . $user->profile_pic);
            }

            // Store new image
            $file = $request->file('profile_pic');
            $filename = time() . '.' . $file->getClientOriginalExtension();
            $file->storeAs('profile_pics', $filename, 'public');
            $user->profile_pic = $filename;
            $user->save(); // Save again for profile_pic path
        }

        return ApiResponse::success('User updated successfully', new UserResource($user->fresh()));
    }


public function GetFullProileEmployee($id)
{
    $user = User::with(['team', 'role'])->find($id);

    if (!$user) {
        return ApiResponse::error('User not found', [], 404);
    }

    // Fetch all project-user mappings
    $projectUserData = DB::table('project_user')
        ->leftJoin('users as pm', 'project_user.project_manager_id', '=', 'pm.id')
        ->leftJoin('projects', 'project_user.project_id', '=', 'projects.id')
        ->select(
            'project_user.user_id',
            'project_user.project_id',
            'projects.project_name',
            'project_user.project_manager_id',
            'pm.name as project_manager_name',
            'project_user.created_at',
            'project_user.updated_at'
        )
        ->where('project_user.user_id', $id)
        ->get();

    // Get performa data (only approved)
    $performaSheets = DB::table('performa_sheets')
        ->where('user_id', $id)
        ->where('status', 'approved')
        ->get();

    $activityData = [];

    foreach ($performaSheets as $row) {
        $decoded = json_decode($row->data, true);
        if (is_string($decoded)) {
            $decoded = json_decode($decoded, true);
        }

        // Log decoded data to check structure
        \Log::info('Decoded Sheet Data', ['sheet_id' => $row->id, 'decoded' => $decoded]);

        $entries = isset($decoded[0]) ? $decoded : [$decoded];

        foreach ($entries as $entry) {
            if (!isset($entry['activity_type'], $entry['time'])) continue;

            $activityType = $entry['activity_type'];
            $projectId = $entry['project_id'] ?? null; // treat null as Inhouse
            $time = $entry['time'];

            $timeParts = explode(':', $time);
            if (count($timeParts) !== 2) continue;

            $minutes = ((int)$timeParts[0] * 60) + (int)$timeParts[1];

            // Grouping by project_id and activity_type
            if (!isset($activityData[$projectId])) {
                $activityData[$projectId] = [];
            }

            if (!isset($activityData[$projectId][$activityType])) {
                $activityData[$projectId][$activityType] = 0;
            }

            $activityData[$projectId][$activityType] += $minutes;
        }
    }

    // Create a new "inhouse" project block if needed
    $projectUserDataArray = $projectUserData->toArray();

    // Handle Inhouse (project_id = null) manually
    if (isset($activityData[null])) {
        $projectUserDataArray[] = (object) [
            'project_id' => null,
            'project_name' => 'Inhouse',
            'project_manager_id' => null,
            'project_manager_name' => null,
            'user_id' => $id,
            'created_at' => null,
            'updated_at' => null,
        ];
    }

    // Attach activity totals to each project
    $finalProjects = collect($projectUserDataArray)->transform(function ($project) use ($activityData) {
        $pid = $project->project_id;
        $activities = [];

        if (isset($activityData[$pid])) {
            foreach ($activityData[$pid] as $type => $minutes) {
                $h = floor($minutes / 60);
                $m = $minutes % 60;

                $activities[] = [
                    'activity_type' => $type,
                    'total_hours' => sprintf('%02d:%02d', $h, $m),
                ];
            }
        }

        $project->activities = $activities;
        return $project;
    });

    return ApiResponse::success('User details fetched successfully', [
        'user' => new UserResource($user),
        'project_user' => $finalProjects,
    ]);
}


public function getUserCountByTeam()
{
    $teams = Team::all(); // get all teams
    $users = User::whereNotNull('team_id')->get();

    $teamUserMap = [];

    // Initialize all teams with 0
    foreach ($teams as $team) {
        $teamUserMap[$team->name . ' Users'] = 0;
    }

    // Count users per team
    foreach ($users as $user) {
        if ($user->team_id && isset($teamUserMap[$user->team->name . ' Users'])) {
            $teamUserMap[$user->team->name . ' Users'] += 1;
        }
    }

    return response()->json([
        'success' => true,
        'data' => $teamUserMap
    ]);
}

}
