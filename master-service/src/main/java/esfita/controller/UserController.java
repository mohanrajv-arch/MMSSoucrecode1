package esfita.controller;

import java.io.IOException;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import esfita.common.ResponseDTO;
import esfita.dto.ComboBoxDTO;
import esfita.dto.CommonAdminDTO;
import esfita.dto.UserAccessDTO;
import esfita.dto.UserMasterDTO;
import esfita.service.UserService;
import io.micrometer.observation.annotation.Observed;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.ws.rs.core.HttpHeaders;

@RestController
@RequestMapping("userController")
public class UserController {

	@Autowired
	private UserService userService;

	@Tag(name = "ScreenCapture")
	@PostMapping("/screenCapture")
	@Observed(name = "screenCapture", contextualName = "screenCapture")
	public String screenCapture(@RequestBody UserAccessDTO userAccessDTO) {
		return userService.screenCapture(userAccessDTO);
	}

	// User Master

	@Tag(name = "User Master")
	@PostMapping("/checkMailId")
	@Observed(name = "checkMailId", contextualName = "checkMailId")
	public ResponseDTO<UserMasterDTO> checkMailId(@RequestBody UserMasterDTO dto) {
		return userService.checkMailId(dto);
	}

	@Tag(name = "User Master")
	@PostMapping("/saveUserMaster")
	@Observed(name = "saveUserMaster", contextualName = "saveUserMaster")
	public ResponseDTO<UserMasterDTO> saveUserMaster(@RequestBody UserMasterDTO userMasterDTO) throws Exception {
		return userService.saveUserMaster(userMasterDTO);
	}

	@Tag(name = "User Master")
	@GetMapping("/listOfUserMaster")
	@Observed(name = "listOfUserMaster", contextualName = "listOfUserMaster")
	public ResponseDTO<UserMasterDTO> listOfUserMaster() {
		return userService.listOfUserMaster();
	}

	@Tag(name = "User Master")
	@GetMapping("viewOfUserMaster/{pk}")
	@Observed(name = "viewOfUserMaster", contextualName = "viewOfUserMaster")
	public ResponseDTO<UserMasterDTO> viewOfUserMaster(@PathVariable("pk") int pk) {
		return userService.viewOfUserMaster(pk);
	}

	@Tag(name = "User Master")
	@PostMapping("/modifyOfUserMaster")
	@Observed(name = "modifyOfUserMaster", contextualName = "modifyOfUserMaster")
	public ResponseDTO<UserMasterDTO> modifyOfUserMaster(@RequestBody UserMasterDTO userMasterDTO) {
		return userService.modifyOfUserMaster(userMasterDTO);
	}

	@Tag(name = "User Master")
	@PostMapping("/statusUpdateOfUser")
	@Observed(name = "statusUpdateOfUser", contextualName = "statusUpdateOfUser")
	public ResponseDTO<UserMasterDTO> statusUpdateOfUser(@RequestBody UserMasterDTO userMasterDTO) {
		return userService.statusUpdateOfUser(userMasterDTO);
	}

	@Tag(name = "User Master")
	@PostMapping("/userPasswordUpdateByAdmin")
	@Observed(name = "userPasswordUpdateByAdmin", contextualName = "userPasswordUpdateByAdmin")
	public ResponseDTO<UserMasterDTO> userPasswordUpdateByAdmin(@RequestBody UserMasterDTO dto) throws Exception {
		return userService.userPasswordUpdateByAdmin(dto);
	}

	// Location Rights

	@Tag(name = "Location Rights")
	@GetMapping("/userDropdownByLocatinRights/{userFk}")
	@Observed(name = "locationListByLocationRights", contextualName = "locationListByLocationRights")
	public ResponseDTO<List<ComboBoxDTO>> locationListByLocationRights(@PathVariable("userFk") int userFk) {
		return userService.locationListByLocationRights(userFk);
	}

	@Tag(name = "Location Rights")
	@GetMapping("/userDropdownByLocatinRights")
	@Observed(name = "userDropdownByLocatinRights", contextualName = "userDropdownByLocatinRights")
	public ResponseDTO<List<ComboBoxDTO>> userDropdownByLocatinRights() {
		return userService.userDropdownByLocatinRights();
	}

	@Tag(name = "Location Rights")
	@PostMapping("/saveLocationRights")
	@Observed(name = "saveLocationRights", contextualName = "saveLocationRights")
	public ResponseDTO<ComboBoxDTO> saveLocationRights(@RequestBody List<ComboBoxDTO> list) {
		return userService.saveLocationRights(list);
	}

	// User Log
	@Tag(name = "User Log")
	@PostMapping("/retreiveUserLog")
	@Observed(name = "retreiveUserLog", contextualName = "retreiveUserLog")
	public ResponseDTO<List<UserAccessDTO>> retreiveUserLog(@RequestBody UserAccessDTO dto) {
		return userService.retreiveUserLog(dto);
	}

	@Tag(name = "User Master")
	@GetMapping("/download/user-master/{id}")
	@Observed(name = "downloadUserMasterReport", contextualName = "downloadUserMasterReport")
	public ResponseEntity<ByteArrayResource> downloadUserMasterReport(@PathVariable("id") int id) throws Exception {
		try {
			ByteArrayResource resource = userService.generateUserMasterReport(id);

			return ResponseEntity.ok()
					.header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=UserMasterReport.xlsx")
					.contentType(MediaType
							.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
					.body(resource);

		} catch (IOException e) {
			throw new RuntimeException("Error generating Excel report", e);
		}
	}

	@Tag(name = "User Log")
	@PostMapping("/retreiveUserLogByExcel")
	@Observed(name = "retreiveUserLogByExcel", contextualName = "retreiveUserLogByExcel")
	public ResponseEntity<byte[]> retreiveUserLogByExcel(@RequestBody UserAccessDTO dto) {
		return userService.downloadUserLogExcel(dto);
	}

	// Common admin

	@Tag(name = "Common admin")
	@PostMapping("/saveCommonAdmin")
	@Observed(name = "saveCommonAdmin", contextualName = "saveCommonAdmin")

	public ResponseDTO<CommonAdminDTO> saveCommonAdmin(@RequestPart("data") CommonAdminDTO dto,
			@RequestPart(value = "screenlogo", required = false) List<MultipartFile> screenlogo,
			@RequestPart(value = "reportLogo", required = false) List<MultipartFile> reportlogo) {
		return userService.saveCommonAdmin(dto, screenlogo, reportlogo);
	}

	@Tag(name = "Common admin")
	@GetMapping("/viewCommonAdmin/{pk}")
	@Observed(name = "viewCommonAdmin", contextualName = "viewCommonAdmin")
	public ResponseDTO<CommonAdminDTO> viewCommonAdmin(@PathVariable("pk") int pk) {
		return userService.viewCommonAdmin(pk);
	}

}
