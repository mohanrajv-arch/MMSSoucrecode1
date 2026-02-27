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
import esfita.dto.MealSetMenuDTO;
import esfita.dto.ResponseDTO;
import esfita.service.MealSetMenuService;
import io.micrometer.observation.annotation.Observed;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.log4j.Log4j2;

@RestController
@Log4j2
@RequestMapping("/mealSetMenuController")
public class MealSetMenuController {

	String json = ".json";
	String dateTimeFormat = "yyyyMMdd_HHmmss";
	private final MealSetMenuService mealSetMenuService;

	private final Path commonJsonDir = Paths.get("C:/Esfita/Microservices/Transaction-1/webapps/AppData/", "Json");
	ObjectMapper mapper = new ObjectMapper();

	public MealSetMenuController(MealSetMenuService mealSetMenuService) {
		this.mealSetMenuService = mealSetMenuService;
	}

	@Tag(name = "MealSetMenu")
	@PostMapping("/mealSetMenuList")
	@Observed(name = "mealSetMenuList", contextualName = "mealSetMenuList")
	public ResponseDTO<MealSetMenuDTO> mealSetMenuList(@RequestBody MealSetMenuDTO mealSetMenuDTO) {
		return mealSetMenuService.mealSetMenuList(mealSetMenuDTO);
	}

	@Tag(name = "MealSetMenu")
	@PostMapping("/mealSetMenuStatusUpdate")
	@Observed(name = "mealSetMenuStatusUpdate", contextualName = "mealSetMenuStatusUpdate")
	public ResponseDTO<MealSetMenuDTO> mealSetMenuStatusUpdate(@RequestBody MealSetMenuDTO dto) {
		return mealSetMenuService.mealSetMenuStatusUpdate(dto);
	}

	@Tag(name = "MealSetMenu")
	@GetMapping("/mealSetMenuViewById/{id}")
	@Observed(name = "mealSetMenuViewById", contextualName = "mealSetMenuViewById")
	public ResponseDTO<MealSetMenuDTO> mealSetMenuViewById(@PathVariable int id) {
		return mealSetMenuService.mealSetMenuViewById(id);
	}

	@Tag(name = "MealSetMenu")
	@PostMapping("/mealSetMenuApprovalStatus")
	@Observed(name = "mealSetMenuApprovalStatus", contextualName = "mealSetMenuApprovalStatus")
	public ResponseDTO<MealSetMenuDTO> mealSetMenuApprovalStatus(@RequestBody MealSetMenuDTO dto) {
		return mealSetMenuService.mealSetMenuApprovalStatus(dto);
	}

	@Tag(name = "MealSetMenu")
	@PostMapping("/categoryListByFk")
	@Observed(name = "categoryListByFk", contextualName = "categoryListByFk")
	public ResponseDTO<List<MealSetMenuDTO>> categoryListByFk(@RequestBody MealSetMenuDTO meal) {
		return mealSetMenuService.categoryListByFk(meal);
	}

	@Tag(name = "MealSetMenu")
	@GetMapping("/loadRecipeMasterDropDown/{categoryFk}")
	@Observed(name = "loadRecipeMasterDropDown", contextualName = "loadRecipeMasterDropDown")
	public ResponseDTO<List<ComboBoxDTO>> loadRecipeMasterDropDown(@PathVariable int categoryFk) {
		return mealSetMenuService.loadRecipeMasterDropDown(categoryFk);
	}

	@Tag(name = "MealSetMenu")
	@GetMapping("/loadMealSetTemplateDropDown/{mealTypeFk}")
	@Observed(name = "loadMealSetTemplateDropDown", contextualName = "loadMealSetTemplateDropDown")
	public ResponseDTO<List<ComboBoxDTO>> loadMealSetTemplateDropDown(@PathVariable int mealTypeFk) {
		return mealSetMenuService.loadMealSetTemplateDropDown(mealTypeFk);
	}

	@Tag(name = "MealSetMenu")
	@PostMapping("/saveMealSetMenu")
	@Observed(name = "saveMealSetMenu", contextualName = "saveMealSetMenu")
	public ResponseDTO<MealSetMenuDTO> saveMealSetMenu(@RequestBody MealSetMenuDTO dto) throws IOException {

		String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern(dateTimeFormat));
		Path jsonPath = commonJsonDir.resolve("saveMealSetMenu" + "_" + timestamp + json);
		String jsonData = mapper.writerWithDefaultPrettyPrinter().writeValueAsString(dto);
		Files.write(jsonPath, jsonData.getBytes(), StandardOpenOption.CREATE, StandardOpenOption.TRUNCATE_EXISTING);
		return mealSetMenuService.saveMealSetMenu(dto);
	}

	@Tag(name = "MealSetMenu")
	@PostMapping("/copyMealSetMenu")
	@Observed(name = "copyMealSetMenu", contextualName = "copyMealSetMenu")
	public ResponseDTO<MealSetMenuDTO> copyMealSetMenu(@RequestBody MealSetMenuDTO dto) {
		return mealSetMenuService.copyMealSetMenu(dto);
	}

	@Tag(name = "MealSetMenu")
	@GetMapping("/mealSetMenuEditById/{id}")
	@Observed(name = "mealSetMenuEditById", contextualName = "mealSetMenuEditById")
	public ResponseDTO<MealSetMenuDTO> mealSetMenuEditById(@PathVariable int id) {
		return mealSetMenuService.mealSetMenuEditById(id);
	}

	@Tag(name = "MealSetMenu")
	@PostMapping("/mealSetMenuModify")
	@Observed(name = "mealSetMenuModify", contextualName = "mealSetMenuModify")
	public ResponseDTO<MealSetMenuDTO> mealSetMenuModify(@RequestBody MealSetMenuDTO dto) throws IOException {

		String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern(dateTimeFormat));
		Path jsonPath = commonJsonDir.resolve("mealSetMenuModify" + "_" + timestamp + json);
		String jsonData = mapper.writerWithDefaultPrettyPrinter().writeValueAsString(dto);
		Files.write(jsonPath, jsonData.getBytes(), StandardOpenOption.CREATE, StandardOpenOption.TRUNCATE_EXISTING);

		return mealSetMenuService.mealSetMenuModify(dto);
	}

	@Tag(name = "MealSetMenu")
	@PostMapping("/listDownload")
	@Observed(name = "listDownload", contextualName = "listDownload")
	public ResponseEntity<byte[]> exportMealSetMenuExcel(@RequestBody MealSetMenuDTO filterDTO) throws IOException {

		String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern(dateTimeFormat));
		Path jsonPath = commonJsonDir.resolve("MealSetMenuListDownload" + "_" + timestamp + json);
		String jsonData = mapper.writerWithDefaultPrettyPrinter().writeValueAsString(filterDTO);
		Files.write(jsonPath, jsonData.getBytes(), StandardOpenOption.CREATE, StandardOpenOption.TRUNCATE_EXISTING);

		return mealSetMenuService.exportMealSetMenuExcel(filterDTO);
	}

	@Tag(name = "MealSetMenu")
	@GetMapping("/viewDownload/{id}/{userId}")
	@Observed(name = "viewDownload", contextualName = "viewDownload")
	public ResponseEntity<byte[]> exportSingleMealSetMenuExcel(@PathVariable("id") int id,
			@PathVariable("userId") int userId) {

		return mealSetMenuService.exportSingleMealSetMenuExcel(id, userId);
	}

	@Tag(name = "MealSetMenu")
	@GetMapping("/loadMealTypeDropDown")
	@Observed(name = "loadMealTypeDropDown", contextualName = "loadMealTypeDropDown")
	public ResponseDTO<List<ComboBoxDTO>> loadMealTypeDropDown() {
		return mealSetMenuService.loadMealTypeDropDown();
	}

	@Tag(name = "MealSetMenu")
	@GetMapping("/loadCategoryDropDown")
	@Observed(name = "loadCategoryDropDown", contextualName = "loadCategoryDropDown")
	public ResponseDTO<List<ComboBoxDTO>> loadCategoryDropDown() {
		return mealSetMenuService.loadCategoryDropDown();
	}
}
