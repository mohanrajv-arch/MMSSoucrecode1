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
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.fasterxml.jackson.databind.ObjectMapper;

import esfita.dto.ComboBoxDTO;
import esfita.dto.MealSetTemplateDTO;
import esfita.dto.ResponseDTO;
import esfita.service.MealSetTemplateService;
import io.micrometer.observation.annotation.Observed;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.log4j.Log4j2;

@RestController
@Log4j2
@RequestMapping("/mealSetTemplateController")
public class MealSetTemplateController {

	String json = ".json";
	String dateTimeFormat = "yyyyMMdd_HHmmss";

	private final ObjectMapper mapper;
	private final MealSetTemplateService mealSetTemplateService;

	public MealSetTemplateController(ObjectMapper mapper, MealSetTemplateService mealSetTemplateService) {
		this.mapper = mapper;
		this.mealSetTemplateService = mealSetTemplateService;
	}

	private final Path commonJsonDir = Paths.get("C:/Esfita/Microservices/Transaction-1/webapps/AppData/", "Json");

	@Tag(name = "MealSetTemplate")
	@GetMapping("/loadMealTypeDropDown")
	@Observed(name = "loadMealTypeDropDown", contextualName = "loadMealTypeDropDown")
	public ResponseDTO<List<ComboBoxDTO>> loadMealTypeDropDown() {
		return mealSetTemplateService.loadMealTypeDropDown();
	}

	@Tag(name = "MealSetTemplate")
	@GetMapping("/loadCategoryDropDown")
	@Observed(name = "loadCategoryDropDown", contextualName = "loadCategoryDropDown")
	public ResponseDTO<List<ComboBoxDTO>> loadCategoryDropDown() {
		return mealSetTemplateService.loadCategoryDropDown();
	}

	@Tag(name = "MealSetTemplate")
	@PostMapping("/mealSetTemplateList")
	@Observed(name = "mealSetTemplateList", contextualName = "mealSetTemplateList")
	public ResponseDTO<MealSetTemplateDTO> mealSetTemplateList(@RequestBody MealSetTemplateDTO dto) {
		return mealSetTemplateService.mealSetTemplateList(dto);
	}

	@Tag(name = "MealSetTemplate")
	@PostMapping("/mealSetStatusUpdate")
	@Observed(name = "mealSetStatusUpdate", contextualName = "mealSetStatusUpdate")
	public ResponseDTO<MealSetTemplateDTO> mealSetStatusUpdate(@RequestBody MealSetTemplateDTO dto) {
		return mealSetTemplateService.mealSetStatusUpdate(dto);
	}

	@Tag(name = "MealSetTemplate")
	@GetMapping("/mealSetViewById")
	@Observed(name = "mealSetViewById", contextualName = "mealSetViewById")
	public ResponseDTO<MealSetTemplateDTO> mealSetViewById(@RequestParam("id") int id) {
		return mealSetTemplateService.mealSetViewById(id);
	}

	@Tag(name = "MealSetTemplate")
	@PostMapping("/saveMealSetTemplate")
	@Observed(name = "saveMealSetTemplate", contextualName = "saveMealSetTemplate")
	public ResponseDTO<MealSetTemplateDTO> saveMealSetTemplate(@RequestBody MealSetTemplateDTO dto) throws IOException {

		String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern(dateTimeFormat));
		Path jsonPath = commonJsonDir.resolve("saveMealSetTemplate" + "_" + timestamp + json);
		String jsonData = mapper.writerWithDefaultPrettyPrinter().writeValueAsString(dto);
		Files.write(jsonPath, jsonData.getBytes(), StandardOpenOption.CREATE, StandardOpenOption.TRUNCATE_EXISTING);
		return mealSetTemplateService.saveMealSetTemplate(dto);
	}

	@Tag(name = "MealSetTemplate")
	@PostMapping("/modifyMealSetTemplate")
	@Observed(name = "modifyMealSetTemplate", contextualName = "modifyMealSetTemplate")
	public ResponseDTO<MealSetTemplateDTO> modifyMealSetTemplate(@RequestBody MealSetTemplateDTO dto)
			throws IOException {

		String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern(dateTimeFormat));
		Path jsonPath = commonJsonDir.resolve("modifyMealSetTemplate" + "_" + timestamp + json);
		String jsonData = mapper.writerWithDefaultPrettyPrinter().writeValueAsString(dto);
		Files.write(jsonPath, jsonData.getBytes(), StandardOpenOption.CREATE, StandardOpenOption.TRUNCATE_EXISTING);

		return mealSetTemplateService.modifyMealSetTemplate(dto);
	}

	@Tag(name = "MealSetTemplate")
	@GetMapping("/modifyViewById")
	@Observed(name = "modifyViewById", contextualName = "modifyViewById")
	public ResponseDTO<MealSetTemplateDTO> modifyViewById(@RequestParam("id") int id) {
		return mealSetTemplateService.modifyViewById(id);
	}

	@Tag(name = "MealSetTemplate")
	@PostMapping("/saveMealSetTemplateCopy")
	@Observed(name = "saveMealSetTemplateCopy", contextualName = "saveMealSetTemplateCopy")
	public ResponseDTO<MealSetTemplateDTO> saveMealSetTemplateCopy(@RequestBody MealSetTemplateDTO dto) {
		return mealSetTemplateService.saveMealSetTemplateCopy(dto);
	}

	@Tag(name = "MealSetTemplate")
	@PostMapping("/saveApprovalStatus")
	@Observed(name = "saveApprovalStatus", contextualName = "saveApprovalStatus")
	public ResponseDTO<MealSetTemplateDTO> saveApprovalStatus(@RequestBody MealSetTemplateDTO dto) {
		return mealSetTemplateService.saveApprovalStatus(dto);
	}

	@Tag(name = "MealSetTemplate")
	@PostMapping("/listDownload")
	@Observed(name = "listDownload", contextualName = "listDownload")
	public ResponseEntity<byte[]> exportMealSetTemplateExcel(@RequestBody MealSetTemplateDTO filterDTO)
			throws IOException {
		String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern(dateTimeFormat));
		Path jsonPath = commonJsonDir.resolve("listDownload" + "_" + timestamp + json);
		String jsonData = mapper.writerWithDefaultPrettyPrinter().writeValueAsString(filterDTO);
		Files.write(jsonPath, jsonData.getBytes(), StandardOpenOption.CREATE, StandardOpenOption.TRUNCATE_EXISTING);

		return mealSetTemplateService.exportMealSetTemplateExcel(filterDTO);
	}

	@Tag(name = "MealSetTemplate")
	@GetMapping("/viewDownload")
	@Observed(name = "viewDownload", contextualName = "viewDownload")
	public ResponseEntity<byte[]> exportMealSetTemplateDetail(@RequestParam("templateId") int templateId,
			@RequestParam("userId") int userId) {

		return mealSetTemplateService.exportMealSetTemplateDetailExcel(templateId, userId);
	}

}
