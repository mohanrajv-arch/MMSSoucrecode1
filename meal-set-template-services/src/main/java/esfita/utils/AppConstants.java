package esfita.utils;

public final class AppConstants {

	private AppConstants() {
		// Prevent instantiation
	}

	// ------------------ Response Messages ------------------
	public static final boolean TRUE = true;
	public static final boolean FALSE = false;
	public static final String ACTIVE = "Active";
	public static final String INACTIVE = "In-Active";
	public static final String MSG_RECORD_CREATED = "Record created successfully";
	public static final String MSG_RECORD_UPDATED = "Record updated successfully";
	public static final String MSG_RECORD_FETCHED = "Fetched successfully";
	public static final String MSG_RECORD_COPY = "Record copied successfully";

	public static final String REST_EXCEPTION = "REST exception while fetching ";
	public static final String EXCEPTION = "Unexpected exception occurred while fetching ";
	public static final String EMPTY_LIST = "List is empty";
	public static final String NOT_FOUND = "Not Found";
	public static final String FOUND = "Details Found";
	public static final String RECORD_NOT_FOUND = "Record not found for this Id ";
	public static final String REST_EXCEPTION_UPDATE = "REST error occurred while updating data ";
	public static final String EXCEPTION_UPDATE = "Internal server error occurred while updating data";
	public static final String EMPTY_DATA = "Empty Data";
	public static final String DATA_EXCEPTION_SAVE = "Database error occurred while saving ";
	public static final String REST_EXCEPTION_SAVE = "REST exception while saving ";
	public static final String EXCEPTION_SAVING = "Unexpected exception while saving ";

	public static final String ACTIVATED = "Activated successfully";
	public static final String INACTIVATED = "Inactivated successfully";

	public static final String CODE_VALIDATION = "Code already exists";
	public static final String APPROVAL_STATUS = "Approval status updated successfully";

	public static final String MEAL_SET_TEMPLATE = "Meal Set Template";

	// Status flags
	public static final char FLAG_A = 'A';
	public static final char FLAG_I = 'I';
}
