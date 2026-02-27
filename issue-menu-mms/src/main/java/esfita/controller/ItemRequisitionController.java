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
import esfita.dto.ItemRequisitionDTO;
import esfita.service.ItemRequisitionService;
import io.micrometer.observation.annotation.Observed;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/itemRequisitionController")
public class ItemRequisitionController {

	@Autowired
	ItemRequisitionService recipeService;

	// Item Requisition List ===================

	@Tag(name = "Item requisition")
	@PostMapping("/itemReqList")
	@Observed(name = "itemReqList", contextualName = "itemReqList")
	public ResponseDTO<ItemRequisitionDTO> itemReqList(@RequestBody ItemRequisitionDTO itemRequisitionDTO) {
		return recipeService.itemReqList(itemRequisitionDTO);
	}

	@Tag(name = "Item requisition")
	@GetMapping("/loadItemDropdown")
	@Observed(name = "loadItemDropdown", contextualName = "loadItemDropdown")
	public ResponseDTO<List<ComboBoxDTO>> loadItemDropdown() {
		return recipeService.loadItemDropdown();
	}

	@Tag(name = "Item requisition")
	@GetMapping("/loadLocationName")
	@Observed(name = "loadLocationName", contextualName = "loadLocationName")
	public ResponseDTO<List<ComboBoxDTO>> loadLocationName() {
		return recipeService.loadLocationName();
	}

	@Tag(name = "Item requisition")
	@PostMapping("/saveItemReq")
	@Observed(name = "saveItemReq", contextualName = "saveItemReq")
	public ResponseDTO<ItemRequisitionDTO> saveItemReq(@RequestBody ItemRequisitionDTO itemRequisitionDTO) {
		return recipeService.saveItemReq(itemRequisitionDTO);
	}

	@Tag(name = "Item requisition")
	@PostMapping("/ItemReqsList")
	@Observed(name = "ItemReqsList", contextualName = "ItemReqsList")
	public ResponseDTO<ItemRequisitionDTO> ItemReqsList(@RequestBody ItemRequisitionDTO itemRequisitionDTO) {
		return recipeService.itemReqsList(itemRequisitionDTO);
	}

	@Tag(name = "Item requisition")
	@GetMapping("/viewItemRequ/{id}")
	@Observed(name = "viewItemRequ", contextualName = "viewItemRequ")
	public ResponseDTO<ItemRequisitionDTO> viewItemRequ(@PathVariable("id") int id) {
		return recipeService.viewItemRequ(id);
	}

	@Tag(name = "Item requisition")
	@GetMapping("/prepareItemRequisitionData/{id}")
	@Observed(name = "prepareItemRequisitionData", contextualName = "prepareItemRequisitionData")
	public ResponseDTO<ItemRequisitionDTO> prepareItemRequisitionData(@PathVariable("id") int id) {
		return recipeService.prepareItemRequisitionData(id);
	}

	@Tag(name = "Item requisition")
	@GetMapping("/printexcelreportForMaterial/{id}/{userId}")
	@Observed(name = "printexcelreportForMaterial", contextualName = "printexcelreportForMaterial")
	public ResponseEntity<byte[]> printexcelreportForMaterial(@PathVariable("id") int id,
			@PathVariable("userId") int userId) {
		return recipeService.printexcelreportForMaterial(id, userId);
	}

	@Tag(name = "Item requisition")
	@GetMapping("/printCSVReportForMaterial/{id}/{userId}")
	@Observed(name = "printCSVReportForMaterial", contextualName = "printCSVReportForMaterial")
	public ResponseEntity<byte[]> printCSVReportForMaterial(@PathVariable("id") int id,
			@PathVariable("userId") int userId) {
		return recipeService.printCsvReportForMaterial(id, userId);
	}

	@Tag(name = "Item requisition")
	@PostMapping("/downloadItemReqExcel")
	@Observed(name = "downloadItemReqExcel", contextualName = "downloadItemReqExcel")
	public ResponseEntity<byte[]> downloadItemReqExcel(@RequestBody ItemRequisitionDTO itemRequisitionDTO) {
		return recipeService.downloadItemReqExcel(itemRequisitionDTO);
	}

	// Estimation
	@Tag(name = "Estimation ")
	@PostMapping("/saveEstimation")
	@Observed(name = "saveEstimation", contextualName = "saveEstimation")
	public ResponseDTO<ItemRequisitionDTO> saveEstimation(@RequestBody ItemRequisitionDTO itemRequisitionDTO) {
		return recipeService.saveEstimation(itemRequisitionDTO);
	}

}
