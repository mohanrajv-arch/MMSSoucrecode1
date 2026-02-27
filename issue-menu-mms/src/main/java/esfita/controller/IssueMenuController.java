package esfita.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import esfita.common.ComboBoxDTO;
import esfita.common.ResponseDTO;
import esfita.dto.IssueMenuToLocationDTO;
import esfita.service.IssueMenuService;
import io.micrometer.observation.annotation.Observed;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/issueMenuController")
public class IssueMenuController {

	@Autowired
	IssueMenuService issueMenuService;

	@Tag(name = "Issue to Menu Location")
	@GetMapping("/loadFinalMenuDropDown")
	@Observed(name = "loadFinalMenuDropDown", contextualName = "loadFinalMenuDropDown")
	public ResponseDTO<List<ComboBoxDTO>> loadFinalMenuDropDown() {
		return issueMenuService.loadFinalMenuDropDown();
	}

	@Tag(name = "Issue to Menu Location")
	@GetMapping("/finalMenuDetailsByPk/{id}")
	@Observed(name = "finalMenuDetailsByPk", contextualName = "finalMenuDetailsByPk")
	public ResponseDTO<IssueMenuToLocationDTO> finalMenuDetailsByPk(@PathVariable("id") int id) {
		return issueMenuService.finalMenuDetailsByPk(id);
	}

	@Tag(name = "Issue to Menu Location")
	@PostMapping("/saveIssuedMenu")
	@Observed(name = "saveIssuedMenu", contextualName = "saveIssuedMenu")
	public ResponseDTO<IssueMenuToLocationDTO> saveIssuedMenu(@RequestBody IssueMenuToLocationDTO dto) {
		return issueMenuService.saveIssuedMenu(dto);
	}

	@Tag(name = "Issue to Menu Location")
	@GetMapping("/issueMenuToLocationList/{locationFk}")
	@Observed(name = "issueMenuToLocationList", contextualName = "issueMenuToLocationList")
	public ResponseDTO<List<IssueMenuToLocationDTO>> issueMenuToLocationList(
			@PathVariable("locationFk") int locationFk) {
		return issueMenuService.issueMenuToLocationList(locationFk);
	}

	@Tag(name = "Issue to Menu Location")
	@GetMapping("/issueMenuApprovedStatusList")
	@Observed(name = "issueMenuApprovedStatusList", contextualName = "issueMenuApprovedStatusList")
	public ResponseDTO<IssueMenuToLocationDTO> issueMenuStatusList() {
		return issueMenuService.issueMenuApprovedStatusList();
	}

	@Tag(name = "Issue to Menu Location")
	@PostMapping("/updateApprovalStatus")
	@Observed(name = "updateApprovalStatus", contextualName = "updateApprovalStatus")
	public ResponseDTO<IssueMenuToLocationDTO> updateApprovalStatus(@RequestBody IssueMenuToLocationDTO dto) {
		return issueMenuService.updateApprovalStatus(dto);
	}

	@Tag(name = "Issue to Menu Location")
	@GetMapping("/issueMenuToLocationUserList/{id}")
	@Observed(name = "issueMenuToLocationUserList", contextualName = "issueMenuToLocationUserList")
	public ResponseDTO<List<IssueMenuToLocationDTO>> issueMenuToLocationUserList(@PathVariable("id") int id) {
		return issueMenuService.issueMenuToLocationUserList(id);
	}

	@Tag(name = "Issue to Menu Location")
	@GetMapping("/issueMenuToLocationUserTabList/{id}")
	@Observed(name = "issueMenuToLocationUserTabList", contextualName = "issueMenuToLocationUserTabList")
	public ResponseDTO<IssueMenuToLocationDTO> issueMenuToLocationUserTabList(@PathVariable("id") int id) {
		return issueMenuService.issueMenuToLocationUserTabList(id);
	}

	@Tag(name = "Issue to Menu Location")
	@PostMapping("/updateIssuedMenuStatusAndPob")
	@Observed(name = "updateIssuedMenuStatusAndPob", contextualName = "updateIssuedMenuStatusAndPob")
	public ResponseDTO<IssueMenuToLocationDTO> updateIssuedMenuStatusAndPob(@RequestBody IssueMenuToLocationDTO dto) {
		return issueMenuService.updateIssuedMenuStatusAndPob(dto);
	}
	

	@Tag(name = "Issue to Menu Location")
	@PostMapping("/fetchIssuedMenuItemsByDFk")
	@Observed(name = "fetchIssuedMenuItemsByDFk", contextualName = "fetchIssuedMenuItemsByDFk")
	public ResponseDTO<List<IssueMenuToLocationDTO>> fetchIssuedMenuItemsByDFk(
			@RequestBody IssueMenuToLocationDTO dto) {
		return issueMenuService.fetchIssuedMenuItemsByDFk(dto);
	}

	@Tag(name = "Issue to Menu Location")
	@GetMapping("/loadLocationDropDown")
	@Observed(name = "loadLocationDropDown", contextualName = "loadLocationDropDown")
	public ResponseDTO<List<ComboBoxDTO>> loadLocationDropDown() {
		return issueMenuService.loadLocationDropDown();
	}

	@Tag(name = "Issue to Menu Location")
	@GetMapping("/printexcelreportForMaterial/{id}/{userid}")
	@Observed(name = "printexcelreportForMaterial", contextualName = "printexcelreportForMaterial")
	public ResponseEntity<byte[]> printexcelreportForMaterial(@PathVariable("id") int id,@PathVariable("userid") int userid) {
		return issueMenuService.printexcelreportForMaterial(id, userid);
	}

	@Tag(name = "Issue to Menu Location")
	@GetMapping("/printSlieExcelreport/{id}/{userid}")
	@Observed(name = "printSlieExcelreport", contextualName = "printSlieExcelreport")
	public ResponseEntity<byte[]> printSlieExcelreport(@PathVariable("id") int id,@PathVariable("userid") int userid) {
		return issueMenuService.printSlieExcelreport(id,userid);
	}

	@Tag(name = "Issue to Menu Location")
	@GetMapping("/loadRecipeMasterDropDown/{categoryFk}")
	@Observed(name = "loadRecipeMasterDropDown", contextualName = "loadRecipeMasterDropDown")
	public ResponseDTO<List<ComboBoxDTO>> loadRecipeMasterDropDown(@PathVariable int categoryFk) {
		return issueMenuService.loadRecipeMasterDropDown(categoryFk);
	}

	@Tag(name = "Issue to Menu Location")
	@GetMapping("/loadUserLocationDropDown/{userFk}")
	@Observed(name = "loadUserLocationDropDown", contextualName = "loadUserLocationDropDown")
	public ResponseDTO<List<ComboBoxDTO>> loadUserLocationDropDown(@PathVariable("userFk") int userFk) {
		return issueMenuService.loadUserLocationDropDown(userFk);
	}
	
	@Tag(name = "Issue to Menu Location")
	@PostMapping("/updateIssueMenu")
	@Observed(name = "updateIssueMenu", contextualName = "updateIssueMenu")
	public ResponseDTO<IssueMenuToLocationDTO> updateIssueMenu(@RequestBody IssueMenuToLocationDTO dto) {
		return issueMenuService.updateIssuedMenu(dto);
	}
}
