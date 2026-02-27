package esfita.utils;

public interface ConstantIFC {
	/**
	 * Numeric Values
	 * */
	
	final int ZERO = 0;
	final int ONE = 1;
	final int TWO = 2;
	final int THREE = 3;
	final int FOUR = 4;
	final int FIVE = 5;
	final int SIX = 6;
	final int SEVEN = 7;
	final int EIGHT = 8;
	final int NINE = 9;
	final int TEN = 10;
	
	final int ELEVEN = 11;
	final int TWELVE = 12;
	final int THIRTEEN = 13;
	final int FOURTEEN = 14;
	final int FIFTEEN = 15;
	final int SIXTEEN = 16;
	final int SEVENTEEN = 17;
	final int EIGHTEEN = 18;
	final int NINETEEN = 19;
	final int TWENTY = 20;  
	final int TWENTYONE = 21;
	
	final int ONELAKH = 100000;
	
	final double ZERO_VALUE = 0.0;
	final int THOUSAND = 1000;
	final boolean TRUE = true;
	final boolean FALSE = false;

	final int PASSWORDEXIPYVALID = 5;

	final int CURRENT = 30;

	final int RECENT = 90;

	final int SEARCH_OPTION = 1;

	

	final int USER_FAVOURITE = 5;
	/*
	 * Active Status
	 */
	final int STATUS_ACTIVE = 1;
	final int STATUS_INACTIVE = 0;
	final int STATUS_ALL = 2;

	final String DELIMETER = "/";
	final String EMPTY_STRING = "";
	

	final String DATEFORMAT = "dd-MM-yyyy";
	final String DATEFORMAT1 = "dd/MM/yyyy";
	final String DATEWITHTIME = "dd-MMM-yyyy HH:mm:ss";
	final String DATEWITHZONE = "dd-MMM-yyyy HH:mm:ss z";
	/*
	 * Prospect Start Letter
	 */
	final String PROSEPCTSTARTLETTER = "NQC";
	final String PERCENTAGE = "%";
	final String COMMA = ",";
	final String HYPHEN = "-";
	final String ACTION = "action";
	final String FORM_ID = "form_id1";
	/*
	 * Simple Date Format
	 */
	final String YY = "yy";
	final String MM = "MM";
	final String DD = "dd";

	final String ACTIVESTATUS = "A";
	final String INACTIVESTATUS = "I";
	final String PAIDSTATUS = "P";
	final String BLOCKSTATUS = "B";
	final String CREATEDSTATUS ="C";
	final String PARTIALPAIDSTATUS ="PP"; 
	final String NEEDTOPAYSTATUS="NOP"; 

	static final String MENSTAT = "M";
	static final String FEMALESTAT = "F";
	static final String TRANSGENDERSTAT = "T";

	static final String MEN = "Male";
	static final String FEMALE = "Female";
	static final String TRANSGENDER = "Transgender";

	static final String MARRY = "M";
	static final String BACH = "B";
	static final String SPIN = "S";
	static final String DIVO = "D";

	static final String MARRIED = "Married";
	static final String BACHELOR = "Bachelor";
	static final String SPINSTER = "Spinster";
	static final String DIVORCED = "Divorced";

	static final String DEFAULT_THEME = "start";
	static final String DEFAULT_CSS = "default.css";
	static final String LIGHT_BLUE = "#000099";
	static final String GREEN_THEME = "aristo";
	static final String GREEN_CSS = "greenformat.css";
	static final String LIGHT_GREEN = "#228B22";
	static final String DEFAULT_AMOUNTFORMAT = "###,###.00";

	final String ACTIVE = "Active";
	final String INACTIVE = "In-Active";
	final String BLACKLISTED = "Black Listed";
	final String WEB_INF = "/WEB-INF";
	final String CLOSED = "Closed";
	final String PAID = "Paid";
	final String CREATES ="Creat";
	final String PARTIALPAID ="Partial Paid"; 
	final String NEEDTOPAY="Need To Pay";
	static final String VEHICLE_SCREEN = "VL";

	
	/*
	 * bean - objects
	 */
	static final String USER_MANAGED_BEAN = "userManagedBean";
	static final String LOGIN_OBJECTS = "loginObjects";
	static final String USER_CREATION_MANAGED_BEAN = "userCreationBean";
	static final String USER_CREATION_OBJECTS = "userCreationObjects";
	static final String USER_CREATION_MOD_OBJECTS = "userCreationModifyObjects";
	/*
	 * Redirect and face config mapping string in bean class
	 */
	static final String SUCCESS = "success";
	static final String FAILURE = "failed";
	static final String LOGOUT = "Logout";
	static final String LOGIN_FAQ = "loginFAQ";
	static final String CHANGE_PASSWORD = "changePassword";
	static final String USERS_VIEW = "usersView";
	static final String USER_CREATION = "userCreation";

	/*
	 * Controller
	 */

	/*
	 * Action
	 */
	static final String LOGIN_ACTION = "LOGIN.ACTION";
	static final String USER_CREATION_ACTION = "USERCREATION.ACTION";
	/*
	 * Service
	 */
	static final String LOGIN_SERVICE = "LoginService";
	static final String USER_CREATION_SERVICE = "UserCreationAndRightsService";

	static final String WARNINGMESSAGE = "Warning";
	static final String INFOMESSAGE = "Information";
	static final String ERRORMESSAGE = "Error";

	static final String MODIFIED = "Modified";
	static final String CREATED = "Create";
	static final String SAVE = "Save";
	static final String DONE = "DONE";

	static final String SPECIAL_ALPHA_CHAR = "Alphabet";
	static final String SPECIAL_NUMERIC_CHAR = "Number";
	static final String SPECIAL_SPECIAL_CHAR = "Special Character";


	static final int TOP = 1;
	static final int LEAST = 2;

	static final String TOP_CHART_CONSTANT = "TOPC";
	static final String TREND_CHART_CONSTANT = "TRENDC";
	static final String FORECAST_CHART_CONSTANT = "FOREC";
	static final String COMPARE_CHART_CONSTANT = "COMPAREC";

	static final String PARAM1 = " (Param 1)";
	static final String PARAM2 = " (Param 2)";
	static final String PARAM3 = " (Param 3)";
	static final String PARAM4 = " (Param 4)";
	static final String PARAM5 = " (Param 5)";
	static final String PARAM6 = " (Param 6)";
	static final String PARAM7 = " (Param 7)";
	static final String PARAM8 = " (Param 8)";
	static final String PARAM9 = " (Param 9)";
	static final String PARAM10 = " (Param 10)";
	static final String PARAM11 = " (Param 11)";
	static final String PARAM12 = " (Param 12)";
	static final String PARAM13 = " (Param 13)";
	static final String PARAM14 = " (Param 14)";
	static final String PARAM15 = " (Param 15)";

	static final int AMOUNT = 2;
	static final int QUANTITY = 1;

	static final String TREND = "TREND";
	static final String DIFOS = "DIF";

	static final String APPROVE = "Approved";
	static final String CANCEL = "Cancelled";
	static final String CREATE = "Created";
	static final String MODIFY = "Modified";
	static final String SENTAPPOVAL = "Sent For Approval";
	static final String HOLD_IN = "Hold";
	static final String REJECT = "Rejected";
	static final String SENDBACKORIG = "Sent back to Originator";
	static final String RECEIPT = "Receipt Created";
	static final String ADVANCE = "Advance Created";
	static final String RECEIPTAPPROVED = "Receipt Approved";
	static final String RECEIPTCANCEL="Receipt Cancelled";
	static final String ADVANCECANCEL = "Advance Cancelled";

	static final String GATE_CREATED = "GAIT_CREATED";
	static final String GAIT_INVOICEAPPROVED = "GAIT_INVOICEAPPROVED";
	static final String GAIT_MODIFIED = "GAIT_MODIFIED";
	static final String GAIT_SENDFORAPPROVAL = "GAIT_SENDFORAPPROVAL";
	static final String GAIT_APPROVED = "GAIT_APPROVED";
	static final String GAIT_COSTCALCULATED = "GAIT_COSTCALCULATED";
	static final String GAIT_HOLD = "GAIT_HOLD";
	static final String GAIT_REJECT = "GAIT_REJECT";
	static final String GAIT_CANCEL = "GAIT_CANCEL";
	static final String GAIT_SENDBACK = "GAIT_SENDBACK";
	static final String GAIT_CLOSED = "GAIT_CLOSED";
	static final String GAIT_CLOSEDMODIFIED = "GAIT_CLOSEDMODIFIED";
	static final String CONFIGINPUT_MENU = "APCLB";
	static final String CHARTCONFIG_MENU = "CCN";
	static final String PROCESS_MENU = "PRO";
	static final String FINALIZE_MENU = "FINZ";
	static final String INVOICE_MENU = "INV";
	static final String COSTCALCULATION_MENU = "CSTC"; 
	static final String GAIT_RECEIPT = "GAIT_RECEIPT";
	static final String GAIT_ADVANCE = "GAIT_ADVANCE";
	static final String GAIT_RECEIPTAPPROVED = "GAIT_RECEIPTAPPROVED";
	static final String GAIT_RECEIPTCANCEL = "GAIT_RECEIPTCANCEL";
	static final String GAIT_ADVANCECANCEL = "GAIT_ADVANCECANCEL";


	static final String STAGE = "STAGE";
	static final String USERFUNCTIONMAPPING = "UFMP";
	static final String ADMINFUNCTIONMAPPING = "AFMP";
	final String SAVEDRECON = "SRC";
	
	static final String AMOUNTNOTMATCHED = "Amount Not Matched";
	static final String PARAMETERNOTMATCHED = "Parameter Not Matched";
	static final String QUANTITYNOTMATCHED = "Quantity Not Matched";
	static final String RECORDNOTFOUND = "Record Not Found";
	static final String COLLECTION_MENU = "COL";
	static final String TRIPSHEET_MENU = "TS";
	static final String CONTRACT_MENU = "CCM";
	static final String CONTRACT1_MENU = "CCL";
	static final String SETTLEMENT_MENU = "SL";
	static final String CARRIERTRIPSHEET_MENU = "CT";
	
	static final String PYMENT_INITIATED = "PTIT" ;
	static final String INV_INITIATED = "IVRD" ;
	static final String PARTI_INITIATED = "PIT" ;
	static final String PARTI_PAID = "PARPD" ;
	static final String HOLD_PAYMENT = "HOLD_PAY" ;
	
	static final String PYMENT_INITIATED_STR = "Payment Initiated" ;
	static final String INV_INITIATED_STR = "Invoice Registered" ;
	static final String PARTI_INITIATED_STR = "Partially Payment Initiated" ;
	static final String PARTI_PAID_STR = "Partially Paid" ;
	static final String HOLD_PAYMEN_STR = "Hold Payment" ;
	static final String INVOICE_PROCESSED = "Invoice Proposed" ;
	
	
	
	
	
	
	final int TWENTYTWO = 22;
	
	
	static final String BANK_TRANSFER = "Bank Transfer" ;
	final String  VENDOR_TYPE = "VENDORTYPE";
	final String  CREDIT_TYPE = "CREDITTYPE";
	final String  PAY_APPROVAL = "PAYAPPROVAL";
	final int TWENTYFOUR = 24;
	final int TWENTYTHREE =23;
	final int TWENTYSIX =26;
	final int TWENTYFIVE =25;
	final String MODIFYSTATUS = "M";
	
	
   //cost centre screen
	static final String COST_CENTRE = "CSCE";
	static final String ADD_BUTTON = "ADD";
	static final String MOD_BUTTON = "MOD";
	static final String VIEW_BUTTON = "VIE";
	static final String UPLOAD_BUTTON = "UPL";
	static final String PUSH_BUTTON = "PUS";
	static final String GENERATE_BUTTON = "GEN";
	static final String SAVE_BUTTON = "SAVE";
	static final String ACTIVE_BUTTON = "ACTV";
	static final String INACTIVE_BUTTON = "IACTV";
	
	
	
}