<?php

use App\Http\Controllers\AccessoryAssignController;
use App\Http\Controllers\AccessoryCategoryController;
use App\Http\Controllers\AccessoryController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\TeamController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\ClientController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\PerformaSheetController;
use App\Http\Controllers\LeaveController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\GraphController;
use App\Http\Controllers\TagActivityController;
use Illuminate\Support\Facades\Artisan;

// Route::get('/user', function (Request $request) {
//     return $request->user();
// })->middleware('auth:sanctum');

Route::get('/storagelink', function() {
    Artisan::call('storage:link');
    return 'Storage link created!';
});

Route::post('/login', [AuthController::class, 'login']);
Route::get('/login', function () {
    return response()->json(['message' => 'Please log in to access this resource.'], 401);
})->name('login');
Route::middleware('auth:api')->group(function () {
    Route::put('/users/{id}', [UserController::class, 'update']);
    Route::post('/users', [UserController::class, 'store']);
    Route::get('/users', [UserController::class, 'index']);
    Route::get('/projectManager', [UserController::class, 'projectManger']);
    Route::get('/users/{id}', [UserController::class, 'show']);
	Route::get('/getfull_proileemployee/{id}', [UserController::class, 'GetFullProileEmployee']);
    Route::delete('/users/{id}', [UserController::class, 'destroy']);
	 Route::get('/getuser-Byteam', [UserController::class, 'getUserCountByTeam']);


    Route::apiResource('/teams', TeamController::class);
    Route::apiResource('/roles', RoleController::class);


    Route::post('/logout', [AuthController::class, 'logout']);

    // Projects API
    Route::get('/clients', [ClientController::class, 'index']);
    Route::post('/clients', [ClientController::class, 'store']);
    Route::put('/clients/{id}', [ClientController::class, 'update']);
    Route::delete('/clients/{id}', [ClientController::class, 'destroy']);
    // Projects API
    Route::get('/projects', [ProjectController::class, 'index']);
    Route::post('/projects', [ProjectController::class, 'store']);
    Route::put('/projects/{id}', [ProjectController::class, 'update']);
    Route::delete('/projects/{id}', [ProjectController::class, 'destroy']);
    Route::post('/assign-project-manager', [ProjectController::class, 'assignProjectToManager']);
    //Route::post('/assign-project-managers', [ProjectController::class, 'getProjectEmployee']);
    Route::get('/assigned-all-projects', [ProjectController::class, 'getAssignedAllProjects']);
    Route::get('/assigned-projects', [ProjectController::class, 'getAssignedProjects']);
    Route::post('/assign-project-to-tl', [ProjectController::class, 'assignProjectToTL']);
    Route::get('/tl-projects', [ProjectController::class, 'getTlProjects']);
    Route::get('/user-projects', [ProjectController::class, 'getUserProjects']);
    Route::get('/get-projectmanager-tl', [ProjectController::class, 'getProjectManagerTl']);
    Route::get('/get-tl-employee', [ProjectController::class, 'getTlEmployee']);
    Route::post('/assign-project-tl-to-employee', [ProjectController::class, 'assignProjectManagerProjectToEmployee']);
	Route::post('/remove-project-managers', [ProjectController::class, 'removeProjectManagers']);
	Route::delete('/remove-project-tl/{project_id}/{tl_ids}', [ProjectController::class, 'removeprojecttl']);
	Route::delete('/remove-project-employee/{project_id}/{user_ids}', [ProjectController::class, 'removeprojectemployee']);
	Route::get('/getfull-projectmananger-data', [ProjectController::class, 'GetFullProjectManangerData']);
	Route::get('/total-departmentproject', [ProjectController::class, 'totaldepartmentProject']);
    Route::get('/get-projectof-employee-assignby-projectmanager', [ProjectController::class, 'getProjectofEmployeeAssignbyProjectManager']);
    Route::get('/employee-projects', [ProjectController::class, 'getemployeeProjects']);


	// Performa API
	Route::post('/add-performa-sheets', [PerformaSheetController::class, 'addPerformaSheets']);
	Route::post('/edit-performa-sheets', [PerformaSheetController::class, 'editPerformaSheets']);
	Route::post('/get-approval-performa-sheets', [PerformaSheetController::class, 'getApprovalPerformaSheets']);
	Route::middleware('auth:api')->group(function () {
    Route::get('/get-performa-sheet', [PerformaSheetController::class, 'getUserPerformaSheets']);
    Route::get('/get-all-performa-sheets', [PerformaSheetController::class, 'getAllPerformaSheets']);
	Route::get('/get-performa-manager-emp', [PerformaSheetController::class, 'getPerformaManagerEmp']);
	Route::post('/sink-performaapi', [PerformaSheetController::class, 'SinkPerformaAPI']);

	// Leaves API
	Route::post('/add-leave', [LeaveController::class, 'Addleave']);
	Route::get('/getall-leave-forhr', [LeaveController::class, 'getallLeavesForHr']);
	Route::get('/getleaves-byemploye', [LeaveController::class, 'getLeavesByemploye']);
	Route::get('/showmanager-leavesfor-teamemploye', [LeaveController::class, 'showmanagerLeavesForTeamemploye']);
	Route::post('/approve-leave', [LeaveController::class, 'approveLeave']);

	// Tasks API
	Route::post('/add-task', [TaskController::class, 'AddTasks']);
	Route::put('/getalltaskofprojectbyid/{id}', [TaskController::class, 'getAllTaskofProjectById']);
	Route::get('/getproject/{id}', [ProjectController::class, 'getProjectById']);
	Route::post('/get-emp-tasksby-project', [TaskController::class, 'getEmployeTasksbyProject']);
	Route::post('/approve-task-ofproject', [TaskController::class, 'ApproveTaskofProject']);
	Route::put('/edit-task/{id}', [TaskController::class, 'EditTasks']);
	Route::delete('/delete-task/{id}', [TaskController::class, 'DeleteTasks']);
    //Route::put('/projects/{id}', [ProjectController::class, 'update']);

	Route::post('/graph-total-workinghour', [GraphController::class, 'GraphTotalWorkingHour']);
	Route::post('/get-workinghour-byproject', [GraphController::class, 'GetWorkingHourByProject']);
	Route::get('/get-weekly-workinghour-byproject', [GraphController::class, 'GetWeeklyWorkingHourByProject']);
	Route::get('/gettotal-workinghour-byemploye', [GraphController::class, 'GetTotalWorkingHourByEmploye']);
	Route::get('/gettotal-weekly-workinghour-byemploye', [GraphController::class, 'GetTotalWeeklyWorkingHourByEmploye']);
	Route::get('/get-lastsixmonths-projectcount', [GraphController::class, 'GetLastSixMonthsProjectCount']);


	Route::post('/addtagsactivity', [TagActivityController::class, 'AddActivityTag']); // Add tag
	Route::get('/getactivity-tag', [TagActivityController::class, 'GetActivityTag']);
	Route::put('/updatetagsactivity/{id}', [TagActivityController::class, 'updateActivityTag']);
	Route::post('/addtagsactivitys', [TagActivityController::class, 'AddActivityTags']); // Add tag
	Route::delete('/deletetagsactivitys/{id}', [TagActivityController::class, 'destroy']);

        // accessory category
	Route::post('/addaccessorycategory', [AccessoryController::class, 'addaccessorycategory']);
	Route::get('/getaccessorycategory', [AccessoryController::class, 'getaccessorycategory']);
	Route::get('/editaccessorycategory/{id}', [AccessoryController::class, 'editaccessorycategory']);
    Route::put('/updateaccessorycategory/{id}', [AccessoryController::class, 'updateaccessorycategory']);
    Route::delete('/deleteaccessorycategory/{id}', [AccessoryController::class, 'deleteaccessorycategory']);

        // accessory add
	Route::post('/addaccessory', [AccessoryController::class, 'addaccessory']);
    Route::get('/allaccessory', [AccessoryController::class, 'allaccessory']);
    Route::get('/getaccessory/{id}', [AccessoryController::class, 'getaccessory']);
	Route::get('/editaccessory/{id}', [AccessoryController::class, 'editaccessory']);
    Route::put('/updateaccessory/{id}', [AccessoryController::class, 'updateaccessory']);
    Route::delete('/deleteaccessory/{id}', [AccessoryController::class, 'deleteaccessory']);
    // Route::get('/countaccessory', [AccessoryController::class, 'countaccessory']);

        // accessory assign
    Route::post('/addaccessoryassign', [AccessoryController::class, 'addaccessoryassign']);
    Route::get('/getaccessoryassign', [AccessoryController::class, 'getaccessoryassign']);
	Route::get('/editaccessoryassign/{id}', [AccessoryController::class, 'editaccessoryassign']);
    Route::put('/updateaccessoryassign/{id}', [AccessoryController::class, 'updateaccessoryassign']);
    Route::delete('/deleteaccessoryassign/{id}', [AccessoryController::class, 'deleteaccessoryassign']);

    //Route::get('/tagsactivity', [TagsActivityController::class, 'index']); // Get all tags
});

});
