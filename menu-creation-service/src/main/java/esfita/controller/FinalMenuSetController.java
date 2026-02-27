package esfita.controller;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardOpenOption;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fasterxml.jackson.databind.ObjectMapper;

import esfita.dto.ComboBoxDTO;
import esfita.dto.FinalMenuSetDTO;
import esfita.dto.ResponseDTO;
import esfita.service.FinalMenuSetService;
import io.micrometer.observation.annotation.Observed;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.log4j.Log4j2;

@RestController
@Log4j2
@RequestMapping("/finalMenuSetController")
public class FinalMenuSetController {

	String json = ".json";
	String dateTimeFormat = "yyyyMMdd_HHmmss";
	private final FinalMenuSetService finalMenuSetService;
	private final Path commonJsonDir = Paths.get("C:/Esfita/Microservices/Transaction-1/webapps/AppData/", json);
	ObjectMapper mapper = new ObjectMapper();

	// Constructor injection
	public FinalMenuSetController(FinalMenuSetService finalMenuSetService) {
		this.finalMenuSetService = finalMenuSetService;
	}

	@Tag(name = "FinalMenuSet")
	@GetMapping("/loadMealTypeDropDown")
	@Observed(name = "loadMealTypeDropDown", contextualName = "loadMealTypeDropDown")
	public ResponseDTO<List<ComboBoxDTO>> loadMealTypeDropDown() {
		return finalMenuSetService.loadMealTypeDropDown();
	}

	@Tag(name = "FinalMenuSet")
	@PostMapping("/finalMenuList")
	@Observed(name = "finalMenuList", contextualName = "finalMenuList")
	public ResponseDTO<FinalMenuSetDTO> finalMenuList(@RequestBody FinalMenuSetDTO finalMenuSetDTO) {
		return finalMenuSetService.finalMenuList(finalMenuSetDTO);
	}

	@Tag(name = "FinalMenuSet")
	@PostMapping("/finalMenuSetStatusUpdate")
	@Observed(name = "finalMenuSetStatusUpdate", contextualName = "finalMenuSetStatusUpdate")
	public ResponseDTO<FinalMenuSetDTO> finalMenuSetStatusUpdate(@RequestBody FinalMenuSetDTO finalMenuSetDTO) {
		return finalMenuSetService.finalMenuSetStatusUpdate(finalMenuSetDTO);
	}

	@Tag(name = "FinalMenuSet")
	@PostMapping("/finalSetMenuApprovalStatus")
	@Observed(name = "finalSetMenuApprovalStatus", contextualName = "finalSetMenuApprovalStatus")
	public ResponseDTO<FinalMenuSetDTO> finalSetMenuApprovalStatus(@RequestBody FinalMenuSetDTO finalMenuSetDTO) {
		return finalMenuSetService.finalSetMenuApprovalStatus(finalMenuSetDTO);
	}

	@Tag(name = "FinalMenuSet")
	@GetMapping("/finalMenuView/{id}")
	@Observed(name = "finalMenuView", contextualName = "finalMenuView")
	public ResponseDTO<FinalMenuSetDTO> finalMenuView(@PathVariable("id") int id) {
		return finalMenuSetService.finalMenuView(id);
	}
	

	@Tag(name = "FinalMenuSet")
	@GetMapping("/finalMenuSetViewByMenu/{finalFk}/{menuFk}")
	@Observed(name = "finalMenuSetViewByMenu", contextualName = "finalMenuSetViewByMenu")
	public ResponseDTO<FinalMenuSetDTO> finalMenuSetViewByMenu(@PathVariable int finalFk, @PathVariable int menuFk) {
		return finalMenuSetService.finalMenuSetViewByMenu(finalFk, menuFk);
	}

	@Tag(name = "FinalMenuSet")
	@GetMapping("/loadMealSetMenuDropDown/{mealTypeFk}")
	@Observed(name = "loadMealSetMenuDropDown", contextualName = "loadMealSetMenuDropDown")
	public ResponseDTO<List<ComboBoxDTO>> loadMealSetMenuDropDown(@PathVariable int mealTypeFk) {
		return finalMenuSetService.loadMealSetMenuDropDown(mealTypeFk);
	}

	@Tag(name = "FinalMenuSet")
	@PostMapping("/saveFinalSetMenu")
	@Observed(name = "saveFinalSetMenu", contextualName = "saveFinalSetMenu")
	public ResponseDTO<FinalMenuSetDTO> saveFinalSetMenu(@RequestBody FinalMenuSetDTO dto) throws IOException {

		String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern(dateTimeFormat));
		Path jsonPath = commonJsonDir.resolve("saveFinalSetMenu" + "_" + timestamp + json);
		String jsonData = mapper.writerWithDefaultPrettyPrinter().writeValueAsString(dto);
		Files.write(jsonPath, jsonData.getBytes(), StandardOpenOption.CREATE, StandardOpenOption.TRUNCATE_EXISTING);

		return finalMenuSetService.saveFinalSetMenu(dto);
	}

	@Tag(name = "FinalMenuSet")
	@GetMapping("/mealSetMenuEditByIdForMenuSet/{id}")
	@Observed(name = "mealSetMenuEditByIdForMenuSet", contextualName = "mealSetMenuEditByIdForMenuSet")
	public ResponseDTO<FinalMenuSetDTO> mealSetMenuEditByIdForMenuSet(@PathVariable int id) {
		return finalMenuSetService.mealSetMenuEditByIdForMenuSet(id);
	}

	@Tag(name = "FinalMenuSet")
	@GetMapping("/viewFinalSetMenuById/{id}")
	@Observed(name = "viewFinalSetMenuById", contextualName = "viewFinalSetMenuById")
	public ResponseDTO<FinalMenuSetDTO> viewFinalSetMenuById(@PathVariable int id) {
		return finalMenuSetService.viewFinalSetMenuById(id);
	}

	@Tag(name = "FinalMenuSet")
	@GetMapping("/finalMenuRecipeEdit/{id}/{menuFk}")
	@Observed(name = "finalMenuRecipeEdit", contextualName = "finalMenuRecipeEdit")
	public ResponseDTO<FinalMenuSetDTO> finalMenuRecipeEdit(@PathVariable int id, @PathVariable int menuFk) {
		return finalMenuSetService.finalMenuRecipeEdit(id, menuFk);
	}

	@Tag(name = "FinalMenuSet")
	@PostMapping("/modifyFinalMenuSet")
	@Observed(name = "modifyFinalMenuSet", contextualName = "modifyFinalMenuSet")
	public ResponseDTO<FinalMenuSetDTO> modifyFinalMenuSet(@RequestBody FinalMenuSetDTO dto) throws IOException {

		String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern(dateTimeFormat));
		Path jsonPath = commonJsonDir.resolve("modifyFinalMenuSet" + "_" + timestamp + json);
		String jsonData = mapper.writerWithDefaultPrettyPrinter().writeValueAsString(dto);
		Files.write(jsonPath, jsonData.getBytes(), StandardOpenOption.CREATE, StandardOpenOption.TRUNCATE_EXISTING);

		return finalMenuSetService.modifyFinalMenuSet(dto);
	}

	@Tag(name = "FinalMenuSet")
	@PostMapping("/copyFinalMenuSet")
	@Observed(name = "copyFinalMenuSet", contextualName = "copyFinalMenuSet")
	public ResponseDTO<FinalMenuSetDTO> copyFinalMenuSet(@RequestBody FinalMenuSetDTO dto) {
		return finalMenuSetService.copyFinalMenuSet(dto);
	}

	@Tag(name = "FinalMenuSet")
	@GetMapping("/loadMealSetTemplateDropDown/{mealTypeFk}")
	@Observed(name = "loadMealSetTemplateDropDown", contextualName = "loadMealSetTemplateDropDown")
	public ResponseDTO<List<ComboBoxDTO>> loadMealSetTemplateDropDown(@PathVariable int mealTypeFk) {
		return finalMenuSetService.loadMealSetTemplateDropDown(mealTypeFk);
	}

	@Tag(name = "FinalMenuSet")
	@GetMapping("/loadCategoryByTemplatePkDropDown/{templateFk}")
	@Observed(name = "loadCategoryByTemplatePkDropDown", contextualName = "loadCategoryByTemplatePkDropDown")
	public ResponseDTO<List<ComboBoxDTO>> loadCategoryByTemplatePkDropDown(@PathVariable int templateFk) {
		return finalMenuSetService.loadCategoryByTemplatePkDropDown(templateFk);
	}

	@Tag(name = "FinalMenuSet")
	@PostMapping("/listDownload")
	@Observed(name = "listDownload", contextualName = "listDownload")
	public ResponseEntity<byte[]> printexcelreport(@RequestBody FinalMenuSetDTO finalMenuSetDTO) throws IOException {

		String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern(dateTimeFormat));
		Path jsonPath = commonJsonDir.resolve("listDownload" + "_" + timestamp + json);
		String jsonData = mapper.writerWithDefaultPrettyPrinter().writeValueAsString(finalMenuSetDTO);
		Files.write(jsonPath, jsonData.getBytes(), StandardOpenOption.CREATE, StandardOpenOption.TRUNCATE_EXISTING);

		return finalMenuSetService.printexcelreport(finalMenuSetDTO);
	}

	@Tag(name = "FinalMenuSet")
	@GetMapping("/viewDownload/{id}/{userId}")
	@Observed(name = "viewDownload", contextualName = "viewDownload")
	public ResponseEntity<byte[]> printexcelreportView(@PathVariable("id") int id, @PathVariable("userId") int userId) {
		return finalMenuSetService.printexcelreportView(id, userId);
	}
}
