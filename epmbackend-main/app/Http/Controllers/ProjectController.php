<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\Project;
use App\Models\Client;
use App\Models\User;
use App\Models\ProjectUser;
use App\Models\PerformaSheet;
use App\Models\TagsActivity;
use App\Http\Helpers\ApiResponse;
use App\Http\Resources\ProjectResource;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

class ProjectController extends Controller
{
    public function index()
    {
        return ApiResponse::success('Projects fetched successfully', ProjectResource::collection(Project::with('client', 'salesTeam')->orderBy('id','DESC')->get()));
    }
public function store(Request $request)
{
    $messages = [
        'project_name.unique' => 'The project name has already been taken.',
    ];

    $validator = Validator::make($request->all(), [
        'sales_team_id' => 'required',
        'client_id' => 'required|exists:clients,id',
        'project_name' => 'required|string|max:255|unique:projects,project_name',
        'requirements' => 'nullable|string',
        'budget' => 'nullable|numeric',
        'deadline' => 'nullable|date',
        'total_hours' => 'nullable|string',
        'tags_activitys' => 'nullable|array',
        'technology' => 'nullable|array', // Ensure it's validated as an array
    ], $messages);

    if ($validator->fails()) {
        return ApiResponse::error('Validation failed', $validator->errors(), 422);
    }

    $validatedData = $validator->validated();

    // Convert tags_activitys to JSON if present
    if ($request->has('tags_activitys')) {
        $validatedData['tags_activitys'] = json_encode($request->tags_activitys);
    }

    // Convert technology to JSON if present
    if ($request->has('technology')) {
        $validatedData['technology'] = json_encode($request->technology);
    }

    $project = Project::create($validatedData);

    return ApiResponse::success('Project created successfully', $project, 201);
}

public function assignProjectToManager(Request $request)
{
    $validatedData = $request->validate([
        'project_id' => 'required|exists:projects,id',
        'project_manager_ids' => 'required|array',
        'project_manager_ids.*' => 'exists:users,id'
    ]);
    $project = Project::findOrFail($validatedData['project_id']);
    $existingManagerIds = json_decode($project->project_manager_id, true) ?? [];
    $mergedManagerIds = array_unique(array_merge($existingManagerIds, $validatedData['project_manager_ids']));
    $project->project_manager_id = json_encode($mergedManagerIds);
    $project->assigned_by = auth()->user()->id;
    $project->save();
    return response()->json([
        'success' => true,
        'message' => 'Project assigned to Project Managers successfully.',
        'data' => [
            'project_id' => $project->id,
            'project_manager_ids' => $mergedManagerIds
        ]
    ]);
}




	public function assignProjectManagerProjectToEmployee(Request $request)
	{
		$projectManagerId = auth()->user()->id;
		 // ✅ Validate Request Data
    $validatedData = $request->validate([
        'project_id' => 'required|exists:projects,id',
        'employee_ids' => 'required|array|min:1',
        'employee_ids.*' => 'exists:users,id'
    ]);

    // ✅ Fetch Project from Database
    $project = Project::find($validatedData['project_id']);

    if (!$project) {
        return ApiResponse::error('Invalid project_id. Project does not exist.', [], 404);
    }

    // ✅ Get Logged-in Project Manager ID
    $projectManagerId = auth()->user()->id;

    $insertedData = [];
    $alreadyAssigned = [];

    try {
        foreach ($validatedData['employee_ids'] as $employeeId) {
            // ✅ Check if the project is already assigned to this employee
            $exists = DB::table('project_user')
                   ->where('project_id', $validatedData['project_id'])
                ->where('user_id', $employeeId)
                ->exists();

            if ($exists) {
                $alreadyAssigned[] = $employeeId;
                continue;
            }

            // ✅ Insert only if not exists
            $insertedId = DB::table('project_user')->insertGetId([
                'project_id' => $validatedData['project_id'],
                'user_id' => $employeeId,
				'project_manager_id' => $projectManagerId,
                'created_at' => now(),
                'updated_at' => now()
            ]);

            $insertedData[] = [
                'id' => $insertedId,  // ✅ Inserted increment ID
                'project_id' => $validatedData['project_id'],
                'user_id' => $employeeId,
				'project_manager_id' => $projectManagerId,
            ];
        }
    } catch (\Exception $e) {
        return ApiResponse::error('Database Error: ' . $e->getMessage(), [], 500);
    }

    // ✅ Prepare Response
    $responseMessage = 'Project assigned successfully';
    if (!empty($alreadyAssigned)) {
        $responseMessage .= '. But these users were already assigned: ' . implode(', ', $alreadyAssigned);
    }

    return ApiResponse::success($responseMessage, [
        'project_manager_id' => $projectManagerId,
        'data' => $insertedData
    ]);
	}

	public function getProjectofEmployeeAssignbyProjectManager()
{
    $projectManagerId = auth()->id();

    $projects = Project::where(function ($query) use ($projectManagerId) {
        // Assuming project_manager_id and tl_id are stored as JSON arrays in the DB
        $query->whereRaw("JSON_CONTAINS(project_manager_id, ?, '$')", [json_encode($projectManagerId)])
              ->orWhereRaw("JSON_CONTAINS(tl_id, ?, '$')", [json_encode($projectManagerId)]);
    })
    ->with(['assignedEmployees:id,name,email','client:id,name'])
    ->get(['id', 'project_name', 'client_id', 'tl_id', 'deadline', 'project_manager_id'])
    ->map(function ($project) {
        // Safely decode tl_id, default to an empty array if null or invalid JSON
        $tlIds = json_decode($project->tl_id, true);

        // Ensure $tlIds is an array before using it in whereIn
        // If json_decode returns null or not an array, default to an empty array
        if (!is_array($tlIds)) {
            $tlIds = [];
        }

        // Only query for team leads if there are actual IDs to query
        if (!empty($tlIds)) {
            $project->team_leads = User::whereIn('id', $tlIds)->get(['id', 'name']);
        } else {
            // If no team lead IDs, assign an empty collection
            $project->team_leads = collect(); // Or new Collection() for older Laravel versions
        }

        return $project;
    });

    if ($projects->isEmpty()) {
        return ApiResponse::error('No projects found for this Project Manager.', [], 404);
    }

    return ApiResponse::success('Projects fetched successfully', [
        'project_manager_id' => $projectManagerId,
        'projects' => $projects
    ]);
}
public function getemployeeProjects()
{
     $projectManagerId = auth()->user()->id;

    // ✅ Fetch All Projects Assigned by This Project Manager (Using JSON_CONTAINS)
    $projects = Project::whereRaw("JSON_CONTAINS(tl_id, ?, '$')", [json_encode($projectManagerId)])
        ->with(['assignedEmployees' => function ($query) {
            $query->select('users.id', 'users.name', 'users.email');
        },'client:id,name'
        ])
        ->get(['id', 'project_name', 'client_id', 'deadline', 'project_manager_id']);

    // ✅ If No Projects Found
    if ($projects->isEmpty()) {
        return ApiResponse::error('No projects found for this Project Manager.', [], 404);
    }

    // ✅ Return Response
    return ApiResponse::success('Projects fetched successfully', [
        'project_manager_id' => $projectManagerId,
        'projects' => $projects
    ]);
}
public function getTlProjects()
{
     $user = auth()->user();

    // Ensure the ID is passed as a JSON string
    $projects = Project::whereRaw("JSON_CONTAINS(tl_id, ?, '$')", [json_encode($user->id)])
        ->with('client', 'assignedBy')
        ->get();

    return ApiResponse::success('Projects fetched successfully', $projects);
}
public function getUserProjects()
{
    try {
        $user = auth()->user();

        $projects = $user->assignedProjects()
            ->with('client')
            ->get()
            ->map(function ($project) {
                $tagIds = $project->tags_activitys ? json_decode($project->tags_activitys, true) : [];

                $tags = TagsActivity::whereIn('id', $tagIds)->get(['id', 'name']);

                return [
                    'id' => $project->id,
                    'project_name' => $project->project_name,
                    'deadline' => $project->deadline,
                    'created_at' => $project->created_at ? Carbon::parse($project->created_at)->toDateString() : null,
                    'updated_at' => $project->updated_at ? Carbon::parse($project->updated_at)->toDateString() : null,
                    'client' => $project->client ?? ['message' => 'No Client Found'],
                    'tags_activitys' => $tags,
                    'pivot' => [
                        'user_id' => $project->pivot->user_id ?? null,
                        'project_id' => $project->pivot->project_id ?? null,
                        'assigned_at' => $project->pivot->created_at
                            ? Carbon::parse($project->pivot->created_at)->toDateString()
                            : 'Not Assigned'
                    ]
                ];
            });

        return ApiResponse::success('User projects fetched successfully', $projects);

    } catch (\Throwable $e) {
        return response()->json([
            'status' => 'error',
            'message' => 'Failed to fetch user projects',
            'error' => $e->getMessage(),
        ], 500);
    }
}



public function getAssignedProjects()
{
    $user = auth()->user();

    // Ensure the ID is passed as a JSON string
    $projects = Project::whereRaw("JSON_CONTAINS(project_manager_id, ?, '$')", [json_encode($user->id)])
        ->with('client', 'assignedBy')
        ->get();

    return ApiResponse::success('Projects fetched successfully', $projects);
}

    public function assignProjectToTL(Request $request)
        {
            $validatedData = $request->validate([
            'project_id' => 'required|exists:projects,id',
            'tl_id' => 'required|array',
            'tl_id.*' => 'exists:users,id'
        ]);

        $project = Project::findOrFail($validatedData['project_id']);
        $existingTlIds = $project->tl_id ? json_decode($project->tl_id, true) : [];
        $mergedTlIds = array_unique(array_merge($existingTlIds, $validatedData['tl_id']));
        $project->tl_id = json_encode($mergedTlIds);
        $project->assigned_by = auth()->user()->id;
        $project->save();
        return response()->json([
            'success' => true,
            'message' => 'Project assigned to Team Leaders successfully.',
            'data' => [
                'project_id' => $project->id,
                'tl_ids' => $mergedTlIds,
                'assigned_by' => $project->assigned_by
            ]
        ]);
    }



	public function update(Request $request, $id)
    {
        $project = Project::find($id);
        if (!$project) {
            return ApiResponse::error('Project not found', [], 404);
        }

        try {
            $validatedData = $request->validate([
                'client_id' => 'required|exists:clients,id',
                'project_name' => 'required|string|max:255|unique:projects,project_name,' . $id,
                'deadline' => 'nullable|date',
                'tags_activitys' => 'nullable|array',
                'technology' => 'nullable|array',
                'tags_activitys.*' => 'integer',
            ]);
        } catch (ValidationException $e) {
            // Return a structured JSON response with validation errors
            return ApiResponse::error(
                'Validation Error',
                $e->errors(), // validation errors as array
                422
            );
        }

        // Update project fields
        $project->update([
            'client_id' => $validatedData['client_id'],
            'project_name' => $validatedData['project_name'],
            'deadline' => $validatedData['deadline'] ?? null,
            'technology' => $validatedData['technology'] ?? null,
        ]);

        // Update tags_activitys if provided
        if (isset($validatedData['tags_activitys'])) {
            $project->tags_activitys = json_encode($validatedData['tags_activitys']);
            $project->save();
        }

        return ApiResponse::success('Project updated successfully', new ProjectResource($project));
    }

    public function destroy($id)
    {
        $project = Project::find($id);
        if (!$project) {
            return ApiResponse::error('Project not found', [], 404);
        }
        DB::table('project_user')->where('project_id', $id)->delete();
        DB::table('tasks')->where('project_id', $id)->delete();

        $project->delete();
        return ApiResponse::success('Project deleted successfully',$project,200);
    }

	public function assignUsersToProject(Request $request, $projectId)
	{
		$project = Project::find($projectId);
		if (!$project) {
			return ApiResponse::error('Project not found', [], 404);
		}
		$request->validate([
        'user_ids' => 'required|array',
        'user_ids.*' => 'exists:users,id'
		]);
		// Attach users to the project (if already assigned, it won't duplicate)
		$project->assignedUsers()->sync($request->user_ids);
		return ApiResponse::success('Users assigned successfully', $project->load('assignedUsers'));
	}

// Projects with  EMployess by all project manager
public function getAssignedAllProjects()
{
	try {
            // ✅ Fetch all projects with assigned users and project managers
            $projects = Project::with([
                'assignedEmployees:id,name,email',  // ✅ Get assigned users (employees)
                'client:id,name'                    // ✅ Get client details
            ])->latest()->get();

            // ✅ Process data for response
            $formattedProjects = $projects->map(function ($project) {
                // ✅ Decode project_manager_id (handles cases where it is stored as JSON)
                $managerIds = json_decode($project->project_manager_id, true) ?? [];

                // ✅ Fetch project managers from `users` table
                if (!empty($managerIds)) {
                    $managers = User::whereIn('id', $managerIds)
                        ->get(['id', 'name'])
                        ->map(function ($manager) {
                            return [
                                'id' => $manager->id,
                                'name' => $manager->name
                            ];
                        })
                        ->toArray();
                } else {
                    $managers = [["id" => null, "name" => "Not Assigned to Any Manager"]];
                }

                return [
                    'id' => $project->id,
                    'project_name' => $project->project_name,
                    'client_name' => $project->client ? $project->client->name : 'No Client Assigned',
                    'budget' => $project->budget,
                    'deadline' => $project->deadline,
                    'total_hours' => $project->total_hours,
                    'assigned_users' => $project->assignedEmployees->map(function ($user) {
                        return [
                            'id' => $user->id,
                            'name' => $user->name,
                            'email' => $user->email,
                        ];
                    }),
                    'project_managers' => $managers
                ];
            });

            return response()->json([
                'success' => true,
                'message' => 'Project assignments fetched successfully.',
                'data' => $formattedProjects
            ]);

        } catch (\Exception $e) {
            Log::error('Error fetching project assignments: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Internal Server Error',
                'error' => $e->getMessage()
            ], 500);
        }
}


/*public function getProjectEmployee()
{
	$user = auth()->user();
	$projects = Project::where('project_manager_id', $user->id)
        ->with([
            'client:id,name', // Get only client id & name
            'projectManager:id,name' // Get project manager id & name
        ])
        ->get(['id', 'project_name', 'client_id']); // Fetch only required fields

    return ApiResponse::success('Projects fetched successfully', $projects);
    //return response()->json(['message' => 'Test']);
}*/

public function getProjectManagerTl()
{
    $user = auth()->user(); // Get logged-in user

    if (!$user->team_id) {
        return response()->json([
            'success' => false,
            'message' => 'Team ID not found for this user.',
            'data' => []
        ]);
    }

    // Fetch all employees in the same team, excluding the logged-in manager
    // $employees = User::where('id', '!=', $user->id)
    //     ->where('role_id', '=', 6)
    //     ->select('id', 'name', 'email', 'profile_pic', 'role_id')
    //     ->get();

    $employees = User::where('id', '!=', $user->id)
    ->whereHas('role', function ($query) {
        $query->where('name', 'TL');
    })
    ->select('id', 'name', 'email', 'profile_pic', 'role_id')
    ->get();

    return response()->json([
        'success' => true,
        'message' => $employees->isEmpty() ? 'No employees found for this team.' : 'Employees fetched successfully',
        'team_id' => $user->team_id,
        'project_manager_id' => $user->id,
        'employees' => $employees
    ]);
}

public function getTlEmployee()
{
    $user = auth()->user(); // Get logged-in user

    if (!$user->team_id) {
        return response()->json([
            'success' => false,
            'message' => 'Team ID not found for this user.',
            'data' => []
        ]);
    }

    // Fetch all employees in the same team, excluding the logged-in manager
    $employees = User::where('id', '!=', $user->id)
        ->where('team_id', '=', $user->team_id)
        ->select('id', 'name', 'email', 'profile_pic', 'role_id')
        ->get();

    return response()->json([
        'success' => true,
        'message' => $employees->isEmpty() ? 'No employees found for this team.' : 'Employees fetched successfully',
        'team_id' => $user->team_id,
        'tl_id' => $user->id,
        'employees' => $employees
    ]);
}


public function removeProjectManagers(Request $request)
{
    try {
        // Validate the incoming request
        $validatedData = $request->validate([
            'project_id' => 'required|exists:projects,id',
            'manager_ids' => 'required|array|min:1',
            'manager_ids.*' => 'integer|exists:users,id'
        ]);

        // Fetch the project
        $project = Project::find($validatedData['project_id']);

        // Decode existing project managers
        $existingManagers = json_decode($project->project_manager_id, true) ?? [];

        // Filter out the managers to be removed
        $updatedManagers = array_diff($existingManagers, $validatedData['manager_ids']);

        // Update the pivot table to remove manager IDs, not delete rows
        $affectedRows = DB::table('project_user')
            ->where('project_id', $validatedData['project_id'])
            ->whereIn('project_manager_id', $validatedData['manager_ids'])
            ->update(['project_manager_id' => null]);

        // Update the project's manager list
        if (empty($updatedManagers)) {
            $project->project_manager_id = null;
        } else {
            $project->project_manager_id = json_encode(array_values($updatedManagers));
        }

        // Save the updated project
        $project->save();

        // Return success response
        return response()->json([
            'success' => true,
            'message' => 'Project managers removed successfully.',
            'updated_rows' => $affectedRows,
            'remaining_managers' => $project->project_manager_id ? json_decode($project->project_manager_id) : null
        ]);

    } catch (\Exception $e) {
        Log::error('Error removing project managers: ' . $e->getMessage());

        return response()->json([
            'success' => false,
            'message' => 'Internal Server Error',
            'error' => $e->getMessage()
        ], 500);
    }
}

public function removeprojecttl($project_id, $tl_id)
{
    // Manual validation
    if (!is_numeric($project_id) || !is_numeric($tl_id)) {
        return response()->json(['error' => 'Invalid parameters'], 422);
    }

    $project = Project::find($project_id);

    if (!$project) {
        return response()->json(['error' => 'Project not found'], 404);
    }

    $tlIds = json_decode($project->tl_id, true);

    if (!is_array($tlIds)) {
        $tlIds = [];
    }

    // Remove the provided TL id
    $updatedTlIds = array_filter($tlIds, fn($id) => $id != $tl_id);

    $project->tl_id = json_encode(array_values($updatedTlIds));
    $project->save();

    return response()->json([
        'success' => true,
        'message' => 'Team Lead removed successfully.',
        'data' => [
            'project_id' => $project->id,
            'updated_tl_id' => $project->tl_id
        ]
    ]);
}

public function removeprojectemployee($project_id, $user_id)
{
    $project = Project::find($project_id);

    if (!$project) {
        return response()->json(['error' => 'Project not found'], 404);
    }

    // Remove the user from the pivot table
    $project->assignedUsers()->detach($user_id);

    return response()->json([
        'success' => true,
        'message' => 'User removed from project successfully.',
    ]);
}


public function GetFullProjectManangerData()
{
    $projects = Project::select('id', 'project_name', 'total_hours', 'total_working_hours', 'project_manager_id')->get();

    // Get all performas that are approved
    $approvedPerformas = PerformaSheet::where('status', 'Approved')->get();

    // Calculate worked hours grouped by project_id and user_id
    $performaHours = [];
    foreach ($approvedPerformas as $sheet) {
        $data = is_array($sheet->data) ? $sheet->data : json_decode($sheet->data, true);
        if (!isset($data['project_id'], $data['time'])) {
            continue;
        }

        $projectId = $data['project_id'];
        $userId = $sheet->user_id;
        $time = floatval($data['time']);

        if (!isset($performaHours[$projectId][$userId])) {
            $performaHours[$projectId][$userId] = 0;
        }
        $performaHours[$projectId][$userId] += $time;
    }

    $projectUserMap = DB::table('project_user')->get()->groupBy('project_id');

    $users = User::select('id', 'name', 'email')->get()->keyBy('id');

    $data = $projects->map(function ($project) use ($users, $projectUserMap, $performaHours) {
        $managerIds = json_decode($project->project_manager_id, true) ?? [];

        // Get users assigned to this project
        $assignedUsers = $projectUserMap[$project->id] ?? collect();

        // Group users under their manager
        $managerUserMap = [];
        foreach ($assignedUsers as $row) {
            $managerId = $row->project_manager_id;
            $userId = $row->user_id;

            if (!in_array($managerId, $managerIds)) {
                $managerIds[] = $managerId; // ensure all managers are captured
            }

            if (!isset($managerUserMap[$managerId])) {
                $managerUserMap[$managerId] = [];
            }

            $user = $users[$userId] ?? null;
            if ($user) {
                $managerUserMap[$managerId][] = [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'worked_hours' => round($performaHours[$project->id][$user->id] ?? 0, 2)
                ];
            }
        }

        // Prepare manager data
        $managers = collect($managerIds)->map(function ($managerId) use ($users, $managerUserMap) {
            $manager = $users[$managerId] ?? null;
            return $manager ? [
                'id' => $manager->id,
                'name' => $manager->name,
                'email' => $manager->email,
                'users' => $managerUserMap[$manager->id] ?? [],
            ] : null;
        })->filter()->values();

        // Calculate total worked hours
        $workedHours = 0;
        foreach (($performaHours[$project->id] ?? []) as $userId => $hours) {
            $workedHours += $hours;
        }

        return [
            'project_id' => $project->id,
            'project_name' => $project->project_name,
            'total_hours' => (float) $project->total_hours,
            'worked_hours' => round($workedHours, 2),
            'remaining_hours' => max((float)$project->total_hours - $workedHours, 0),
            'project_managers' => $managers,
        ];
    });

    return response()->json([
        'success' => true,
        'data' => $data
    ]);
}


    public function totaldepartmentProject()
    {

        $projects = Project::all();

        $teamProjectMap = [];

        foreach ($projects as $project) {
            $managerIds = json_decode($project->project_manager_id, true);

            if (empty($managerIds)) {
                // If no manager is assigned
                $teamProjectMap['Not Assigned'] = ($teamProjectMap['Not Assigned'] ?? 0) + 1;
                continue;
            }

            // Fetch managers with their teams
            $managers = User::with('team:id,name')
                ->whereIn('id', $managerIds)
                ->get();

            // Get unique team names from assigned managers
            $teamNames = $managers
                ->filter(fn ($user) => $user->team)
                ->pluck('team.name')
                ->unique();

            // If no team found even after managers
            if ($teamNames->isEmpty()) {
                $teamProjectMap['Not Assigned'] = ($teamProjectMap['Not Assigned'] ?? 0) + 1;
            } else {
                foreach ($teamNames as $teamName) {
                    $teamProjectMap[$teamName] = ($teamProjectMap[$teamName] ?? 0) + 1;
                }
            }
        }

        return response()->json([
            'success' => true,
            'data' => $teamProjectMap,
        ]);
    }
}
