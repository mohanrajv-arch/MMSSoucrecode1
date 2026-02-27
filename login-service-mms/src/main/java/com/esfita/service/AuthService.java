package com.esfita.service;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.text.SimpleDateFormat;
import java.time.LocalDateTime;
import java.util.Date;
import java.util.List;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import com.esfita.dto.CommonAdminDTO;
import com.esfita.dto.LoginRequestDTO;
import com.esfita.dto.LoginResponseDTO;
import com.esfita.dto.ResetPasswordRequestDTO;
import com.esfita.dto.ResponseDTO;
import com.esfita.entity.AppPreference;
import com.esfita.entity.MstUserAuditTrail;
import com.esfita.entity.MstUserHib;
import com.esfita.repository.AppPreferenceRepository;
import com.esfita.repository.MstUserAuditTrailRepository;
import com.esfita.repository.MstUserRepository;
import com.esfita.util.AppUtils;
import com.esfita.util.JwtUtil;

@Service
public class AuthService {
	private static final Logger log = LoggerFactory.getLogger(AuthService.class);

	@Autowired
	private MstUserRepository userRepo;
	@Autowired
	private MstUserAuditTrailRepository auditRepo;
	@Autowired
	private AppPreferenceRepository appPreferenceRepo;
	@Autowired
	private JwtUtil jwtUtil;

	public ResponseDTO<LoginResponseDTO> login(LoginRequestDTO request) throws Exception {
		Optional<MstUserHib> optionalUser = userRepo.findByEmailId(request.getEmail());

		if (optionalUser.isEmpty()) {
			return ResponseDTO.<LoginResponseDTO>builder().success(false).message("User ID does not exist").data(null)
					.build();
		}

		MstUserHib user = optionalUser.get();

		if (!"A".equalsIgnoreCase(user.getStatus())) {
			return ResponseDTO.<LoginResponseDTO>builder().success(false).message("User is not active").data(null)
					.build();
		}

		if (!AppUtils.decrypt(user.getPassword()).equals(request.getPassword())) {
			return ResponseDTO.<LoginResponseDTO>builder().success(false).message("Invalid credentials").data(null)
					.build();
		}

		// Invalidate old session
		user.setSessionToken(null);
		user.setSessionExpiry(null);

		String token = jwtUtil.generateToken(user.getEmailId());
//		Date expiry = new Date(System.currentTimeMillis() + 86400000);
		Date expiry = new Date(System.currentTimeMillis() + (30 * 60 * 1000));
		long minutes = (30 * 60 * 1000) / (60 * 1000);
		System.out.println("Time - " + minutes + " minutes");
		user.setSessionToken(token);
		user.setSessionExpiry(expiry);
		user.setLastSignedIn(new Date());
		userRepo.save(user);

		// Audit trail
		MstUserAuditTrail audit = new MstUserAuditTrail();
		audit.setUserFk(user.getUserPk());
		audit.setLoginTime(LocalDateTime.now());
		audit.setUserType(user.getUserType());
		audit.setIpAddress(request.getIpAddress());
		audit.setBrowserDetails(request.getBrowserDetails());
		audit.setOsDetails(request.getOsDetails());
		audit.setCreatedBy(user.getUserPk());
		audit.setCreatedDate(LocalDateTime.now());
		auditRepo.save(audit);

		// Prepare response DTO
		LoginResponseDTO loginResponse = new LoginResponseDTO();
		loginResponse.setToken(token);
		loginResponse.setUserId(user.getUserPk());
		loginResponse.setUserType(user.getUserType());
		loginResponse.setEmailId(user.getEmailId());
		loginResponse.setFirstName(user.getFirstName());
		loginResponse.setLastName(user.getLastName());
		loginResponse.setAuditPk(audit.getId());
		loginResponse.setLoginTime(new Date());
//		loginResponse.setTokenExpire(new SimpleDateFormat("dd-MM-yyyy HH:mm:ss").format(user.getSessionExpiry()));
		appPreferenceRepo.findTopByOrderByIdDesc().ifPresent(loginResponse::setAppPreference);

		loginResponse.setNumberFormat(getFormat(loginResponse.getAppPreference().getnUMBER_FORMAT()));

		return ResponseDTO.<LoginResponseDTO>builder().success(true).message("Login successful").data(loginResponse)
				.build();
	}

	public static String getFormat(String formatType) {
		switch (formatType.toUpperCase()) {
		case "EUROPE":
			return "Decimal Separator: ',', Grouping Separator: '.', Grouping Pattern: 3-3-3";
		case "INDIAN":
			return "Decimal Separator: '.', Grouping Separator: ',', Grouping Pattern: 3-2-2";
		default: // US
			return "Decimal Separator: '.', Grouping Separator: ',', Grouping Pattern: 3-3-3";
		}
	}

	public void logout(String email) {
		userRepo.findByEmailId(email).ifPresent(user -> {
			user.setSessionToken(null);
			user.setSessionExpiry(null);
			userRepo.save(user);
		});
	}

	public void logout(String email, Integer auditTrailId) {
		userRepo.findByEmailId(email).ifPresent(user -> {
			user.setSessionToken(null);
			user.setSessionExpiry(null);
			userRepo.save(user);

			// Set logout time if trail exists
			auditRepo.findById(auditTrailId).ifPresent(audit -> {
				if (audit.getLogoutTime() == null) {
					audit.setLogoutTime(LocalDateTime.now());
					auditRepo.save(audit);
				}
			});
		});
	}

	public ResponseDTO<Void> resetPassword(ResetPasswordRequestDTO request) throws Exception {
		MstUserHib user = userRepo.findByEmailId(request.getEmail())
				.orElseThrow(() -> new RuntimeException("User ID does not exist"));

		if (!"A".equalsIgnoreCase(user.getStatus())) {
			return ResponseDTO.<Void>builder().success(false).message("User is not active").build();
		}
		user.setPassword(AppUtils.encrypt(request.getNewPassword()));
		user.setLastPasswordUpdateDate(new Date());

		userRepo.save(user);

		return ResponseDTO.<Void>builder().success(true).message("Password reset successfully").build();
	}

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

	// Helper method to avoid code duplication
	private String convertFilePathToUrl(String filePath) {
	    if (filePath == null || filePath.trim().isEmpty()) return null;

	    String lowerPath = filePath.toLowerCase();
	    String folder = null;

	    if (lowerPath.contains("screen_image")) {
	        folder = "screen_image";
	    } else if (lowerPath.contains("report_image")) {
	        folder = "report_image";
	    }

	    if (folder != null) {
	        int index = lowerPath.indexOf(folder);
	        String relativePath = filePath.substring(index).replace("\\", "/");
	        String baseUrl = ServletUriComponentsBuilder.fromCurrentContextPath().build().toUriString();
	        return baseUrl + "/" + relativePath;
	    }

	    return null;
	}

}
