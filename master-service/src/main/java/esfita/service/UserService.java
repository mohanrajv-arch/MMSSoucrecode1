package esfita.service;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.IOException;
import java.net.Inet4Address;
import java.net.InetAddress;
import java.net.NetworkInterface;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.text.SimpleDateFormat;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.Enumeration;
import java.util.List;
import java.util.Optional;

import org.apache.poi.ss.usermodel.BorderStyle;
import org.apache.poi.ss.usermodel.FillPatternType;
import org.apache.poi.ss.usermodel.HorizontalAlignment;
import org.apache.poi.ss.usermodel.IndexedColors;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.xssf.usermodel.XSSFCell;
import org.apache.poi.xssf.usermodel.XSSFCellStyle;
import org.apache.poi.xssf.usermodel.XSSFFont;
import org.apache.poi.xssf.usermodel.XSSFRow;
import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import org.springframework.web.multipart.MultipartFile;

import esfita.common.AppConstants;
import esfita.common.AppUtils;
import esfita.common.ResponseDTO;
import esfita.common.RestException;
import esfita.dto.ComboBoxDTO;
import esfita.dto.CommonAdminDTO;
import esfita.dto.UserAccessDTO;
import esfita.dto.UserMasterDTO;
import esfita.entity.AppPreference;
import esfita.entity.MstLocationMenuHib;
import esfita.entity.MstLocationUserMappingHib;
import esfita.entity.MstUserAccessScreen;
import esfita.entity.MstUserAuditTrail;
import esfita.entity.MstUserHib;
import esfita.repositoy.AppPreferenceRepository;
import esfita.repositoy.MstLocationMenuRepository;
import esfita.repositoy.MstLocationUserMappingRepository;
import esfita.repositoy.MstUserAccessScreenRepository;
import esfita.repositoy.MstUserAuditTrailRepository;
import esfita.repositoy.MstUserRepository;
import jakarta.servlet.http.HttpServletRequest;

@Service
public class UserService {

	private static final Logger log = LoggerFactory.getLogger(UserService.class);

	private static final String STATUS_ACTIVE = "A";
	private static final String STATUS_INACTIVE = "I";
	private static final String STATUS_CREATED = "C";
	private static final String SUCCESS = "success";
	private static final String FAILURE = "failure";
	private static final String FAILED = "failed";
	private static final String USER_TYPE_ADMIN = "Admin";
	private static final String USER_TYPE_LOCATION_USER = "Location's User";
	private static final String USER_TYPE_SUPER_USER = "Super User";

	private final MstUserRepository userRepository;
	private final MstUserAuditTrailRepository userAuditTrailRepository;
	private final MstUserAccessScreenRepository mstUserAccessScreenRepository;
	private final MstLocationMenuRepository mstLocationMenuRepository;
	private final MstLocationUserMappingRepository mstLocationUserMappingRepository;
	private final AppPreferenceRepository appPreferenceRepo;

	public UserService(MstUserRepository userRepository, MstUserAuditTrailRepository userAuditTrailRepository,
			MstUserAccessScreenRepository mstUserAccessScreenRepository,
			MstLocationMenuRepository mstLocationMenuRepository,
			MstLocationUserMappingRepository mstLocationUserMappingRepository,
			AppPreferenceRepository appPreferenceRepo) {
		this.userRepository = userRepository;
		this.userAuditTrailRepository = userAuditTrailRepository;
		this.mstUserAccessScreenRepository = mstUserAccessScreenRepository;
		this.mstLocationMenuRepository = mstLocationMenuRepository;
		this.mstLocationUserMappingRepository = mstLocationUserMappingRepository;
		this.appPreferenceRepo = appPreferenceRepo;
	}

	public String screenCapture(UserAccessDTO dto) {
		String response = "";

		try {

			MstUserAccessScreen hib = new MstUserAccessScreen();

			Optional<MstUserAuditTrail> auditHib = userAuditTrailRepository.findById(dto.getAuditPk());

			if (auditHib.isPresent()) {
				MstUserAuditTrail audit = auditHib.get();
				hib.setUserFk(audit.getUserFk());
			}

			hib.setAuditFk(dto.getAuditPk());
			hib.setInTime(dto.getLogin());
			hib.setOutTime(dto.getLogout());
			hib.setScreenName(dto.getScreenUrl());
			hib.setTotalTime(dto.getTotalSpendTime());
			hib.setCreatedDate(new Date());
			hib.setUserFk(dto.getUserFk());

			mstUserAccessScreenRepository.save(hib);

			response = SUCCESS;
		} catch (Exception e) {
			log.info("Exception Occured while Saving Menu:" + e);
			response = FAILED;
		}

		return response;
	}

	// User Master

	public ResponseDTO<UserMasterDTO> checkMailId(UserMasterDTO dto) {
		ResponseDTO<UserMasterDTO> response = new ResponseDTO<>();
		try {
			if (dto != null) {
				Optional<MstUserHib> emailId1 = userRepository.findByEmailId(dto.getEmailId());
				if (emailId1.isEmpty()) {

					response.setSuccess(AppConstants.TRUE);
				} else {
					response.setSuccess(AppConstants.FALSE);
					response.setMessage(dto.getEmailId() + AppConstants.MAIL_VALIDATION);
				}
			} else {
				response.setSuccess(AppConstants.FALSE);
				response.setMessage(AppConstants.E_DATA);
			}

		} catch (Exception e) {
			response.setSuccess(AppConstants.FALSE);
			response.setMessage(AppConstants.EXCEPTION);
		}

		return response;
	}

	public ResponseDTO<UserMasterDTO> saveUserMaster(UserMasterDTO dto) {

		ResponseDTO<UserMasterDTO> response = new ResponseDTO<>();

		try {

			if (dto == null) {
				response.setSuccess(false);
				response.setMessage("Request body is empty");
				return response;
			}

			// --- validate email ---
			if (dto.getEmailId() == null || dto.getEmailId().trim().isEmpty()) {
				response.setSuccess(false);
				response.setMessage("Email ID is required");
				return response;
			}

			// normalize email
			String email = dto.getEmailId().trim().toLowerCase();

			// --- duplicate email check ---
			Optional<MstUserHib> existing = userRepository.findByEmailId(email);

			if (existing.isPresent()) {
				response.setSuccess(false);
				response.setMessage("Email already exists");
				return response;
			}

			// --- build entity ---
			MstUserHib hib = new MstUserHib();

			hib.setFirstName(dto.getFirstName());
			hib.setLastName(dto.getLastName());
			hib.setEmailId(email);
			hib.setMobileNo(dto.getMobileNo());
			hib.setUserType(dto.getUserType());
			hib.setStatus(STATUS_ACTIVE);

			// encrypt password
			hib.setPassword(AppUtils.encrypt(dto.getPassword()));

			hib.setCreatedBy(dto.getCreatedBy());
			hib.setCreatedDate(new Date());
			hib.setLastActBy(dto.getCreatedBy());
			hib.setLastActDate(new Date());

			// --- save ---
			hib = userRepository.save(hib);

			// --- prepare response dto ---
			dto.setUserPk(hib.getUserPk());

			response.setData(dto);
			response.setSuccess(true);
			response.setMessage("User created successfully");

		} catch (Exception e) {

			log.error("Error saving user", e);
			response.setSuccess(false);
			response.setMessage("Failed to save user");
		}

		return response;
	}

	public ResponseDTO<UserMasterDTO> listOfUserMaster() {
		ResponseDTO<UserMasterDTO> response = new ResponseDTO<>();

		List<MstUserHib> userDetailsList = new ArrayList<>();
		List<UserMasterDTO> userDetailsDTOList = new ArrayList<>();
		try {

			UserMasterDTO dto = new UserMasterDTO();

			userDetailsList = userRepository.orderBy();
			if (null != userDetailsList) {

				for (MstUserHib hib : userDetailsList) {
					UserMasterDTO udDto = new UserMasterDTO();

					udDto.setUserPk(hib.getUserPk());
					udDto.setFirstName(hib.getFirstName());
					udDto.setLastName(hib.getLastName());
					udDto.setEmailId(hib.getEmailId());
					udDto.setMobileNo(hib.getMobileNo());
					udDto.setPassword(AppUtils.decrypt(hib.getPassword()));

					if (hib.getUserType() == 1) {
						udDto.setUserTypeStr(USER_TYPE_ADMIN);
					} else if (hib.getUserType() == 2) {
						udDto.setUserTypeStr(USER_TYPE_LOCATION_USER);
					} else if (hib.getUserType() == 3) {
						udDto.setUserTypeStr(USER_TYPE_SUPER_USER);
					}
					if (hib.getStatus() == null) {
						udDto.setStatus(hib.getStatus());
					} else if (hib.getStatus().equalsIgnoreCase(STATUS_INACTIVE)) {
						udDto.setStatus("In-Active");
					} else if (hib.getStatus().equalsIgnoreCase(STATUS_ACTIVE)) {
						udDto.setStatus("Active");
					} else if (hib.getStatus().equalsIgnoreCase(STATUS_CREATED)) {
						udDto.setStatus("Created");
					}
					udDto.setCreatedDate(hib.getCreatedDate());
					userDetailsDTOList.add(udDto);
				}

				dto.setUserDetailsList(userDetailsDTOList);
			} else {
				response.setSuccess(false);
				response.setMessage("No Data");

			}
			response.setData(dto);
			response.setSuccess(true);
			log.info("<----User Details fetched Successfully, No of records-->" + userDetailsDTOList.size());
		} catch (RestException re) {
			log.warn("Error while get All role ===", re);

		} catch (Exception e) {
			log.error("Exception Occured ===>>", e);
		}
		log.info("<<<< ------- User Master Details ---------- >>>>>>>");
		return response;
	}

	private String getApproverName(Integer approverId) {
		if (approverId == null)
			return "";
		return userRepository.findById(approverId).map(u -> u.getFirstName()).orElse("");
	}

	public ByteArrayResource generateUserMasterReport(int generatedBy) throws Exception {

		List<MstUserHib> userDetailsList = userRepository.findAll();

		try (XSSFWorkbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {

			XSSFSheet sheet = workbook.createSheet("Users");

			// ===== HEADER STYLE =====
			XSSFCellStyle headerStyle = workbook.createCellStyle();
			XSSFFont headerFont = workbook.createFont();
			headerFont.setBold(true);
			headerFont.setColor(IndexedColors.WHITE.getIndex());

			headerStyle.setFont(headerFont);
			headerStyle.setFillForegroundColor(IndexedColors.BLUE.getIndex());
			headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
			headerStyle.setAlignment(HorizontalAlignment.CENTER);

			// borders
			headerStyle.setBorderBottom(BorderStyle.THIN);
			headerStyle.setBorderTop(BorderStyle.THIN);
			headerStyle.setBorderLeft(BorderStyle.THIN);
			headerStyle.setBorderRight(BorderStyle.THIN);

			// ===== BODY STYLE =====
			XSSFCellStyle dataStyle = workbook.createCellStyle();
			dataStyle.setBorderBottom(BorderStyle.THIN);
			dataStyle.setBorderTop(BorderStyle.THIN);
			dataStyle.setBorderLeft(BorderStyle.THIN);
			dataStyle.setBorderRight(BorderStyle.THIN);

			// ====== REPORT HEADER (Generated date & generated by) ======
			int infoRowIndex = 0;

			XSSFRow infoRow1 = sheet.createRow(infoRowIndex++);
			infoRow1.createCell(0).setCellValue("Generated Date:");
			infoRow1.createCell(1)
					.setCellValue(LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd-MM-yyyy HH:mm")));

			XSSFRow infoRow2 = sheet.createRow(infoRowIndex++);
			infoRow2.createCell(0).setCellValue("Generated By:");
			infoRow2.createCell(1).setCellValue(getApproverName(generatedBy));

			// ===== TABLE HEADER ROW INDEX (leave a blank line) =====
			int tableHeaderRowIndex = infoRowIndex + 1;

			// Header names (Removed User PK, Added S.No)
			String[] headers = { "S.No", "First Name", "Last Name", "Email", "Mobile No", "Role", "Status" };

			// Create header row
			XSSFRow headerRow = sheet.createRow(tableHeaderRowIndex);

			for (int i = 0; i < headers.length; i++) {
				XSSFCell cell = headerRow.createCell(i);
				cell.setCellValue(headers[i]);
				cell.setCellStyle(headerStyle);
			}

			// ===== FILL DATA =====
			int rowIndex = tableHeaderRowIndex + 1;
			int serialNo = 1;

			for (MstUserHib user : userDetailsList) {
				XSSFRow row = sheet.createRow(rowIndex++);

				int col = 0;

				// S.No
				XSSFCell sNoCell = row.createCell(col++);
				sNoCell.setCellValue(serialNo++);
				sNoCell.setCellStyle(dataStyle);

				// First Name
				XSSFCell cell1 = row.createCell(col++);
				cell1.setCellValue(user.getFirstName());
				cell1.setCellStyle(dataStyle);

				// Last Name
				XSSFCell cell2 = row.createCell(col++);
				cell2.setCellValue(user.getLastName());
				cell2.setCellStyle(dataStyle);

				// Email
				XSSFCell cell3 = row.createCell(col++);
				cell3.setCellValue(user.getEmailId());
				cell3.setCellStyle(dataStyle);

				// Mobile
				XSSFCell cell4 = row.createCell(col++);
				cell4.setCellValue(user.getMobileNo());
				cell4.setCellStyle(dataStyle);

				// Role
				XSSFCell cell5 = row.createCell(col++);
				cell5.setCellValue(getUserType(user.getUserType()));
				cell5.setCellStyle(dataStyle);

				// Status
				XSSFCell cell6 = row.createCell(col++);
				cell6.setCellValue(getStatus(user.getStatus()));
				cell6.setCellStyle(dataStyle);
			}

			// Auto-size columns
			for (int i = 0; i < headers.length; i++) {
				sheet.autoSizeColumn(i);
			}

			workbook.write(out);
			return new ByteArrayResource(out.toByteArray());
		}
	}

	private String getUserType(Integer type) {
		return switch (type) {
		case 1 -> USER_TYPE_ADMIN;
		case 2 -> USER_TYPE_LOCATION_USER;
		case 3 -> USER_TYPE_SUPER_USER;
		default -> "Unknown";
		};
	}

	private String getStatus(String status) {
		if (status == null)
			return "Unknown";
		return switch (status) {
		case STATUS_ACTIVE -> "Active";
		case STATUS_INACTIVE -> "In-Active";
		case STATUS_CREATED -> "Created";
		default -> status;
		};
	}

	public ResponseDTO<UserMasterDTO> viewOfUserMaster(int userPK) {

		ResponseDTO<UserMasterDTO> response = new ResponseDTO<>();

		UserMasterDTO userDetailsDTO = new UserMasterDTO();
		try {

			Optional<MstUserHib> hib1 = userRepository.findById(userPK);
			if (hib1.isPresent()) {
				MstUserHib hib = hib1.get();
				userDetailsDTO.setUserPk(hib.getUserPk());
				userDetailsDTO.setFirstName(hib.getFirstName());
				userDetailsDTO.setLastName(hib.getLastName());
				userDetailsDTO.setEmailId(hib.getEmailId());
				userDetailsDTO.setPassword(AppUtils.decrypt(hib.getPassword()));
				userDetailsDTO.setMobileNo(hib.getMobileNo());
				userDetailsDTO.setRoleFk(hib.getUserType());
				userDetailsDTO.setStatus(hib.getStatus());

				response.setData(userDetailsDTO);
				response.setSuccess(true);
			}
		} catch (RestException re) {
			log.warn("Error while get All role====", re);
		} catch (Exception e) {
			log.error("Exception Occured ===>>", e);
		}
		log.info("<<<< ------- User Master Details ---------- >>>>>>>");

		return response;
	}

	public ResponseDTO<UserMasterDTO> modifyOfUserMaster(UserMasterDTO selectView) {
		ResponseDTO<UserMasterDTO> response = new ResponseDTO<>();
		try {
			Optional<MstUserHib> hib1 = userRepository.findById(selectView.getUserPk());
			if (hib1.isPresent()) {
				MstUserHib hib = hib1.get();
				hib.setFirstName(selectView.getFirstName());
				hib.setLastName(selectView.getLastName());
				hib.setUserType(selectView.getUserType());

				userRepository.save(hib);
				response.setMessage(SUCCESS);
				response.setSuccess(true);
			} else {
				response.setMessage(FAILURE);
				response.setSuccess(false);
			}
		} catch (RestException exception) {
			response.setMessage(FAILURE);
		}
		return response;
	}

	public ResponseDTO<UserMasterDTO> statusUpdateOfUser(UserMasterDTO userDetailsDTO) {
		ResponseDTO<UserMasterDTO> response = new ResponseDTO<>();
		try {
			Optional<MstUserHib> userHib1 = userRepository.findById(userDetailsDTO.getUserPk());

			if (userHib1.isPresent()) {
				MstUserHib userHib = userHib1.get();
				if (userDetailsDTO.getStatus().equalsIgnoreCase(STATUS_ACTIVE)) {
					userHib.setStatus(STATUS_ACTIVE);
				} else if (userDetailsDTO.getStatus().equalsIgnoreCase(STATUS_INACTIVE)) {
					userHib.setStatus(STATUS_INACTIVE);
				}

				userRepository.save(userHib);
				response.setMessage(SUCCESS);
				response.setSuccess(true);
			} else {
				response.setSuccess(false);
			}
		} catch (RestException exception) {
			response.setMessage(FAILURE);
		}
		return response;
	}

	public ResponseDTO<UserMasterDTO> userPasswordUpdateByAdmin(UserMasterDTO userMasterDTO) throws Exception {
		ResponseDTO<UserMasterDTO> response = new ResponseDTO<>();
		try {
			Optional<MstUserHib> userHib1 = userRepository.findById(userMasterDTO.getUserPk());
			if (userHib1.isPresent()) {
				MstUserHib userHib = userHib1.get();
				if (!userMasterDTO.getPassword().isEmpty()) {
					userHib.setLastPasswordUpdateDate(new Date());
					userHib.setLastActBy(userMasterDTO.getLastActBy());
					userHib.setPassword(AppUtils.encrypt(userMasterDTO.getPassword()));
					userHib.setLastActDate(new Date());
					userRepository.save(userHib);
					response.setMessage(SUCCESS);
					response.setSuccess(true);
				} else {
					response.setMessage(FAILURE);
				}
			}
		} catch (RestException exception) {
			response.setMessage(FAILURE);
		}
		return response;
	}

	// ---------------------------------------------------------------------------------------------------------------------------------------

	// Location User Mapping
	public ResponseDTO<List<ComboBoxDTO>> locationListByLocationRights(int userFk) {
		ResponseDTO<List<ComboBoxDTO>> response = new ResponseDTO<>();

		List<MstLocationMenuHib> hibsummaryList;
		List<ComboBoxDTO> responseList = new ArrayList<>();

		try {
			hibsummaryList = mstLocationMenuRepository.byStatusActive();

			if (hibsummaryList != null && !hibsummaryList.isEmpty()) {
				for (MstLocationMenuHib hib : hibsummaryList) {

					ComboBoxDTO dto = new ComboBoxDTO();
					dto.setPk(hib.getMslocationPk());
					dto.setCode(hib.getMsLocationId());
					dto.setName(hib.getMsLocationName());

					MstLocationUserMappingHib accHib = mstLocationUserMappingRepository.findActiveMapping(userFk,
							hib.getMslocationPk());

					dto.setPkTwo(accHib != null ? 1 : 0);
					dto.setCheck(accHib != null);
					dto.setPkThree(userFk);

					responseList.add(dto);
				}
			}

			response.setData(responseList);
			response.setMessage("Location list loaded successfully");
			response.setSuccess(true);

			log.info("<----Location List fetched Successfully, No of records-->" + responseList.size());

		} catch (Exception e) {
			log.error("Exception Occured === >>", e);
			response.setSuccess(false);
			response.setMessage(e.getMessage());
		}

		return response;
	}

	public ResponseDTO<List<ComboBoxDTO>> userDropdownByLocatinRights() {
		ResponseDTO<List<ComboBoxDTO>> response = new ResponseDTO<>();

		List<MstUserHib> hibsummaryList = new ArrayList<>();
		List<ComboBoxDTO> responseList = new ArrayList<>();

		try {
			hibsummaryList = userRepository.forUserDropdown(2);
			if (hibsummaryList != null && !hibsummaryList.isEmpty()) {
				for (MstUserHib hib : hibsummaryList) {
					ComboBoxDTO dto = new ComboBoxDTO();
					dto.setPk(hib.getUserPk());
					dto.setName(hib.getFirstName());
					dto.setCode(hib.getEmailId());
					responseList.add(dto);
				}
			}
			response.setData(responseList);
			response.setSuccess(true);
		} catch (RestException re) {
			log.warn("Error while get All user=====", re);
			response.setSuccess(false);
		} catch (Exception e) {
			log.error("Exception Occured === >>", e);
		}
		return response;
	}

	public ResponseDTO<ComboBoxDTO> saveLocationRights(List<ComboBoxDTO> list) {
		ResponseDTO<ComboBoxDTO> response = new ResponseDTO<>();
		try {
			for (ComboBoxDTO dto : list) {
				if (dto.isCheck()) {
					MstLocationUserMappingHib accHib = mstLocationUserMappingRepository
							.findActiveMapping(dto.getPkThree(), dto.getLocationFk());
					if (accHib != null) {
						log.info("Already Exist");
						response.setMessage("Already Exist");

					} else {
						MstLocationUserMappingHib hib = new MstLocationUserMappingHib();
						hib.setLocationFk(dto.getLocationFk());
						hib.setUserId(dto.getPkThree());
						hib.setStatus(STATUS_ACTIVE);
						hib.setCreatedDate(new Date());
						mstLocationUserMappingRepository.save(hib);
					}
				} else {
					MstLocationUserMappingHib accHib = mstLocationUserMappingRepository
							.findActiveMapping(dto.getPkThree(), dto.getLocationFk());
					if (accHib != null) {
						accHib.setStatus(STATUS_INACTIVE);
						mstLocationUserMappingRepository.save(accHib);
					}
				}
			}
			response.setMessage(SUCCESS);
			response.setSuccess(true);
		} catch (RestException re) {
			log.warn("Error while get All role =====", re);
			response.setMessage(FAILED);
			response.setSuccess(false);
		} catch (Exception e) {
			log.error("Exception Occured ===> >", e);
			response.setMessage(FAILED);
			response.setSuccess(false);
		}
		return response;
	}

	public ResponseDTO<List<UserAccessDTO>> retreiveUserLog(UserAccessDTO dto1) {
		ResponseDTO<List<UserAccessDTO>> response = new ResponseDTO<>();
		List<UserAccessDTO> userAuditDTOList = new ArrayList<>();
		DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd-MM-yyyy HH:mm:ss");
		try {

			Integer userType = dto1.getUserType();
			// Determine start and end dates based on retrieve type
			Calendar calendar = Calendar.getInstance();
			Date startDate = null;
			Date endDate = null;

			switch (dto1.getRetrieveType()) {
			case 1 -> { // Daily
				calendar.setTime(dto1.getDay());
				calendar.set(Calendar.HOUR_OF_DAY, 0);
				calendar.set(Calendar.MINUTE, 0);
				calendar.set(Calendar.SECOND, 0);
				calendar.set(Calendar.MILLISECOND, 0);
				startDate = calendar.getTime();

				calendar.add(Calendar.DAY_OF_MONTH, 1);
				endDate = calendar.getTime();
			}
			case 2 -> { // Weekly
				calendar.setTime(dto1.getDay());
				startDate = calendar.getTime();
				calendar.add(Calendar.DAY_OF_MONTH, 6);
				endDate = calendar.getTime();
			}
			case 3 -> { // Monthly
				calendar.setTime(dto1.getDay());
				calendar.set(Calendar.DAY_OF_MONTH, 1);
				startDate = calendar.getTime();
				calendar.set(Calendar.DAY_OF_MONTH, calendar.getActualMaximum(Calendar.DAY_OF_MONTH));
				endDate = calendar.getTime();
			}
			case 4 -> { // Yearly
				calendar.clear();
				calendar.set(Calendar.YEAR, dto1.getYearInt());
				calendar.set(Calendar.MONTH, Calendar.JANUARY);
				calendar.set(Calendar.DAY_OF_MONTH, 1);
				startDate = calendar.getTime();
				calendar.set(Calendar.MONTH, Calendar.DECEMBER);
				calendar.set(Calendar.DAY_OF_MONTH, 31);
				endDate = calendar.getTime();
			}
			default -> {
				response.setMessage("Invalid retrieve type.");
				return response;
			}
			}

			// Fetch audit records
			List<MstUserAuditTrail> hibAuditList = userAuditTrailRepository.byFromDateAndToDate(startDate, endDate,
					userType);

			// Map to DTO
			for (MstUserAuditTrail hib : hibAuditList) {
				UserAccessDTO dto = new UserAccessDTO();
				dto.setUserFk(hib.getUserFk());

				userRepository.findById(hib.getUserFk()).ifPresent(userHib -> {
					dto.setUserName(userHib.getFirstName() + " " + userHib.getLastName());
					dto.setUserEmailId(userHib.getEmailId());

					// Set user type word
					switch (userHib.getUserType()) {
					case 1 -> dto.setUserTypeWord(USER_TYPE_ADMIN);
					case 2 -> dto.setUserTypeWord(USER_TYPE_LOCATION_USER);
					case 3 -> dto.setUserTypeWord(USER_TYPE_SUPER_USER);
					default -> dto.setUserTypeWord("N/A");
					}

					dto.setUserType(userHib.getUserType());
				});

				dto.setIpAddress(hib.getIpAddress());
				dto.setMacId(hib.getMacId());
				dto.setBrowser(hib.getBrowserDetails());
				dto.setOsDetail(hib.getOsDetails());

				// Format login/logout safely
				dto.setLoginTime(hib.getLoginTime());
				dto.setLoginStr(hib.getLoginTime() != null ? hib.getLoginTime().format(formatter) : "");

				dto.setLogoutTime(hib.getLogoutTime());
				// Format logout time
				dto.setLogoutStr(hib.getLogoutTime() != null ? hib.getLogoutTime().format(formatter) : "");

				userAuditDTOList.add(dto);
			}

			response.setData(userAuditDTOList);

		} catch (Exception e) {
			e.printStackTrace();
			log.error(e.getMessage());
			response.setMessage("Error while retrieving user log: " + e.getMessage());
		}

		return response;
	}

	public ResponseEntity<byte[]> downloadUserLogExcel(UserAccessDTO dto1) {
		List<MstUserAuditTrail> hibAuditList = new ArrayList<>();
		List<UserAccessDTO> userAuditDTOList = new ArrayList<>();
		DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd-MM-yyyy HH:mm:ss");

		try {
			Integer userType = dto1.getUserType();
			Date startDate = null;
			Date endDate = null;
			Calendar calendar = Calendar.getInstance();

			switch (dto1.getRetrieveType()) {
			case 1: // Daily
				calendar.setTime(dto1.getDay());
				calendar.set(Calendar.HOUR_OF_DAY, 0);
				calendar.set(Calendar.MINUTE, 0);
				calendar.set(Calendar.SECOND, 0);
				calendar.set(Calendar.MILLISECOND, 0);
				startDate = calendar.getTime();

				calendar.add(Calendar.DAY_OF_MONTH, 1);
				endDate = calendar.getTime();
				hibAuditList = userAuditTrailRepository.byFromDateAndToDate(startDate, endDate, userType);
				break;

			case 2: // Weekly
				calendar.setTime(dto1.getDay());
				startDate = calendar.getTime();
				calendar.add(Calendar.DAY_OF_MONTH, 6);
				endDate = calendar.getTime();
				hibAuditList = userAuditTrailRepository.byFromDateAndToDate(startDate, endDate, userType);
				break;

			case 3: // Monthly
				calendar.setTime(dto1.getDay());
				calendar.set(Calendar.DAY_OF_MONTH, 1);
				startDate = calendar.getTime();
				calendar.set(Calendar.DAY_OF_MONTH, calendar.getActualMaximum(Calendar.DAY_OF_MONTH));
				endDate = calendar.getTime();
				hibAuditList = userAuditTrailRepository.byFromDateAndToDate(startDate, endDate, userType);
				break;

			case 4: // Yearly
				calendar.clear();
				calendar.set(Calendar.YEAR, dto1.getYearInt());
				calendar.set(Calendar.MONTH, Calendar.JANUARY);
				calendar.set(Calendar.DAY_OF_MONTH, 1);
				startDate = calendar.getTime();
				calendar.set(Calendar.MONTH, Calendar.DECEMBER);
				calendar.set(Calendar.DAY_OF_MONTH, 31);
				endDate = calendar.getTime();
				hibAuditList = userAuditTrailRepository.byFromDateAndToDate(startDate, endDate, userType);
				break;

			default:
				return ResponseEntity.badRequest().build();
			}

			for (MstUserAuditTrail hib : hibAuditList) {
				UserAccessDTO dto = new UserAccessDTO();
				dto.setUserFk(hib.getUserFk());
				Optional<MstUserHib> userHib1 = userRepository.findById(hib.getUserFk());

				if (userHib1.isPresent()) {
					MstUserHib userHib = userHib1.get();
					dto.setUserName(userHib.getFirstName());
					dto.setUserEmailId(userHib.getEmailId());
					dto.setUserType(userHib.getUserType());

					switch (userHib.getUserType()) {
					case 1:
						dto.setUserTypeWord(USER_TYPE_ADMIN);
						break;
					case 2:
						dto.setUserTypeWord(USER_TYPE_LOCATION_USER);
						break;
					case 3:
						dto.setUserTypeWord(USER_TYPE_SUPER_USER);
						break;
					default:
						dto.setUserTypeWord("N/A");
					}

					dto.setIpAddress(hib.getIpAddress());
					dto.setMacId(hib.getMacId());
					dto.setBrowser(hib.getBrowserDetails());
					dto.setOsDetail(hib.getOsDetails());

					if (hib.getLoginTime() != null) {
						dto.setLoginTime(hib.getLoginTime());

						dto.setLoginStr(hib.getLoginTime() != null ? hib.getLoginTime().format(formatter) : "");
					}
					if (hib.getLogoutTime() != null) {
						dto.setLogoutTime(hib.getLogoutTime());
						dto.setLogoutStr(hib.getLogoutTime() != null ? hib.getLogoutTime().format(formatter) : "");

					}

					userAuditDTOList.add(dto);
				}
			}

			// Excel generation
			XSSFWorkbook workbook = new XSSFWorkbook();
			XSSFSheet sheet = workbook.createSheet("User Log");

			// ===== HEADERS (with S.No) =====
			String[] headers = { "S.No", "User Name", "Email ID", "User Type", "IP Address", "MAC ID", "Browser", "OS",
					"Login Time", "Logout Time" };

			Row headerRow = sheet.createRow(0);
			for (int i = 0; i < headers.length; i++) {
				headerRow.createCell(i).setCellValue(headers[i]);
			}

			// ===== DATA ROWS WITH S.No =====
			int rowIdx = 1;
			int sNo = 1;

			for (UserAccessDTO data : userAuditDTOList) {

				Row row = sheet.createRow(rowIdx++);

				// S.No
				row.createCell(0).setCellValue(sNo++);

				row.createCell(1).setCellValue(data.getUserName());
				row.createCell(2).setCellValue(data.getUserEmailId());
				row.createCell(3).setCellValue(data.getUserTypeWord());
				row.createCell(4).setCellValue(data.getIpAddress());
				row.createCell(5).setCellValue(data.getMacId());
				row.createCell(6).setCellValue(data.getBrowser());
				row.createCell(7).setCellValue(data.getOsDetail());
				row.createCell(8).setCellValue(data.getLoginStr());
				row.createCell(9).setCellValue(data.getLogoutStr());
			}

			// Auto-size columns
			for (int i = 0; i < headers.length; i++) {
				sheet.autoSizeColumn(i);
			}

			// Write to output
			ByteArrayOutputStream out = new ByteArrayOutputStream();
			workbook.write(out);
			workbook.close();
			byte[] excelBytes = out.toByteArray();

			HttpHeaders headersOut = new HttpHeaders();
			headersOut.setContentType(MediaType.APPLICATION_OCTET_STREAM);
			headersOut.setContentDispositionFormData("attachment", "UserLog_" + System.currentTimeMillis() + ".xlsx");

			return new ResponseEntity<>(excelBytes, headersOut, HttpStatus.OK);

		} catch (Exception e) {
			e.printStackTrace();
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
		}
	}
// Common Admin

	public ResponseDTO<CommonAdminDTO> saveCommonAdmin(CommonAdminDTO dto, List<MultipartFile> screenlogo,
			List<MultipartFile> reportLogo) {

		ResponseDTO<CommonAdminDTO> response = new ResponseDTO<>();

		try {

			if (dto == null) {
				response.setSuccess(false);
				response.setMessage("DTO is empty");
				return response;
			}

			AppPreference app = appPreferenceRepo.findOne(dto.getPk());
			if (app == null) {
				response.setSuccess(false);
				response.setMessage("Record not found");
				return response;
			}

// ------------------------------
// Handle Screen Logo
// ------------------------------

			MultipartFile file = screenlogo.get(0);

			if (!file.isEmpty()) {
				saveLogoFile(app.getaP_FILE_UPLOAD(), "screen_image", file);
				app.setScreenLogo(Paths.get(app.getaP_FILE_UPLOAD(), "screen_image", "logo.png").toString());
			}

// ------------------------------
// Handle Report Logo
// ------------------------------

			MultipartFile file1 = reportLogo.get(0);

			if (!file1.isEmpty()) {
				saveLogoFile(app.getaP_FILE_UPLOAD(), "report_image", file1);
				app.setReportLogo(Paths.get(app.getaP_FILE_UPLOAD(), "report_image", "logo.png").toString());
			}

// ------------------------------
// Save Other Preferences
// ------------------------------
			app.setaP_CURRENCY(dto.getCurrency());
			app.setaP_DATE_FORMAT(dto.getDateFormat());
			app.setaP_DATE_TIME_FORMAT(dto.getDateTimeFormat());
			app.setdECIMAL_TO_QTY(dto.getQtyDecimal());
			app.setdECIMAL_TO_VALUE(dto.getCostDecimal());
			app.setnUMBER_FORMAT(dto.getNumberFormat());
			app.setaP_LAST_ACT_BY(dto.getLastActBy());
			app.setaP_LAST_ACT_DATE(new Date());
			app.setRecipeModify(dto.getRecipeModify());

			appPreferenceRepo.save(app);

			response.setSuccess(true);
			response.setMessage("Save Success");

		} catch (Exception e) {
			e.printStackTrace();
			log.error("Exception Occurred ===>>", e);
			response.setSuccess(false);
			response.setMessage("Failed");
		}

		return response;
	}

	private void saveLogoFile(String baseUploadPath, String folderName, MultipartFile file) throws IOException {

		if (baseUploadPath == null || baseUploadPath.trim().isEmpty()) {
			throw new IOException("Upload base path is empty");
		}

		Path imageDir = Paths.get(baseUploadPath, folderName);
		Path logoFilePath = imageDir.resolve("logo.png");

		// Create main directory
		if (!Files.exists(imageDir)) {
			Files.createDirectories(imageDir);
		}

		// Backup old logo
		if (Files.exists(logoFilePath)) {
			Path backupDir = imageDir.resolve("previous");
			if (!Files.exists(backupDir)) {
				Files.createDirectories(backupDir);
			}

			String backupName = "logo_" + new SimpleDateFormat("yyyyMMddHHmmss").format(new Date()) + ".png";
			Files.move(logoFilePath, backupDir.resolve(backupName), StandardCopyOption.REPLACE_EXISTING);
		}

		// Save new file
		file.transferTo(logoFilePath.toFile());
	}

	public ResponseDTO<CommonAdminDTO> viewCommonAdmin(int pk) {
		ResponseDTO<CommonAdminDTO> response = new ResponseDTO<>();

		try {
			AppPreference app = appPreferenceRepo.findOne(pk);

			if (app == null) {
				response.setSuccess(false);
				response.setMessage("App preference not found for ID: " + pk);
				return response;
			}

			CommonAdminDTO dto = new CommonAdminDTO();
			dto.setPk(pk);
			dto.setDateFormat(app.getaP_DATE_FORMAT());
			dto.setDateTimeFormat(app.getaP_DATE_TIME_FORMAT());
			dto.setCurrency(app.getaP_CURRENCY());
			dto.setNumberFormat(app.getnUMBER_FORMAT());
			dto.setQtyDecimal(app.getdECIMAL_TO_QTY());
			dto.setCostDecimal(app.getdECIMAL_TO_VALUE());
			dto.setRecipeModify(app.getRecipeModify());

			// Process screen logo
			String screenLogoPath = app.getScreenLogo();
			if (screenLogoPath != null && !screenLogoPath.trim().isEmpty()) {
				File file = new File(screenLogoPath);
				if (file.exists() && file.isFile()) {
					String screenLogoUrl = convertFilePathToUrl(screenLogoPath);
					dto.setScreenLogo(screenLogoUrl);
				} else {
					dto.setScreenLogo(null);
				}
			} else {
				dto.setScreenLogo(null);
			}

			// Process report logo - FIXED: was using screenLogoPath instead of
			// reportLogoPath
			String reportLogoPath = app.getReportLogo();
			if (reportLogoPath != null && !reportLogoPath.trim().isEmpty()) {
				File file = new File(reportLogoPath);
				if (file.exists() && file.isFile()) {
					String reportLogoUrl = convertFilePathToUrl(reportLogoPath);
					dto.setReportLogo(reportLogoUrl); // FIXED: missing semicolon
				} else {
					dto.setReportLogo(null);
				}
			} else {
				dto.setReportLogo(null);
			}

			response.setSuccess(true);
			response.setData(dto);
			response.setMessage("Common admin data retrieved successfully");

		} catch (Exception e) {
			log.error("Error retrieving common admin data for PK: ", e); // FIXED: incomplete log statement
			response.setSuccess(false);
			response.setMessage("Error retrieving common admin data: " + e.getMessage());
		}
		return response;
	}

	private String convertFilePathToUrl(String filePath) {
		if (filePath == null || filePath.trim().isEmpty())
			return null;

		String lowerPath = filePath.toLowerCase();
		String folder = null;

		if (lowerPath.contains("screen_image"))
			folder = "screen_image";
		else if (lowerPath.contains("report_image"))
			folder = "report_image";

		if (folder != null) {
			int index = lowerPath.indexOf(folder);
			String relativePath = filePath.substring(index).replace("\\", "/");

			// Get request info
			HttpServletRequest request = ((ServletRequestAttributes) RequestContextHolder.currentRequestAttributes())
					.getRequest();

			String scheme = request.getScheme(); // http/https
			int port = request.getServerPort(); // port
			String host = getServerIPv4(); // get server IP since host header not preserved

			String portPart = (port == 80 && scheme.equals("http")) || (port == 443 && scheme.equals("https")) ? ""
					: ":" + port;

			String baseUrl = scheme + "://" + host + portPart + "/master-service";
			return baseUrl + "/" + relativePath;
		}

		return null;
	}

//	
	/**
	 * Utility to get server IPv4 automatically
	 */
	private String getServerIPv4() {
		try {
			Enumeration<NetworkInterface> interfaces = NetworkInterface.getNetworkInterfaces();
			while (interfaces.hasMoreElements()) {
				NetworkInterface ni = interfaces.nextElement();
				if (!ni.isUp() || ni.isLoopback())
					continue;

				Enumeration<InetAddress> addresses = ni.getInetAddresses();
				while (addresses.hasMoreElements()) {
					InetAddress addr = addresses.nextElement();
					if (addr instanceof Inet4Address && !addr.isLoopbackAddress()) {
						return addr.getHostAddress();
					}
				}
			}
		} catch (Exception e) {
			e.printStackTrace();
		}
		return "localhost"; // fallback
	}
}
