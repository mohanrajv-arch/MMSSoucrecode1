package esfita.controller;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardOpenOption;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
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

import com.fasterxml.jackson.databind.ObjectMapper;

import esfita.common.ComboBoxDTO;
import esfita.common.ResponseDTO;
import esfita.dto.CategoryRecipeMappingDTO;
import esfita.dto.RecipeListingDTO;
import esfita.dto.RecipeMasterDTO;
import esfita.dto.RecipeMasterListDTO;
import esfita.dto.RecipeMealMappingDTO;
import esfita.service.RecipeService;
import io.micrometer.observation.annotation.Observed;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/recipeController")
public class RecipeController {

	@Autowired
	RecipeService recipeService;

	private final Path COMMON_JSON_DIR = Paths.get("C:/Esfita/Microservices/masters/webapps/AppData/", "Json");
	ObjectMapper mapper = new ObjectMapper();

	@Tag(name = "Recipe Master")
	@PostMapping("/recipeMasterList")
	@Observed(name = "recipeMasterList", contextualName = "recipeMasterList")
	public ResponseDTO<List<RecipeMasterListDTO>> recipeMasterList(
			@RequestBody RecipeMasterListDTO recipeMasterListDTO) {
		return recipeService.recipeMasterList(recipeMasterListDTO);
	}

	@Tag(name = "Recipe Master")
	@PostMapping("/recipeStatusUpdate")
	@Observed(name = "recipeStatusUpdate", contextualName = "recipeStatusUpdate")
	public ResponseDTO<RecipeMasterListDTO> recipeStatusUpdate(@RequestBody RecipeMasterListDTO dto) {
		return recipeService.recipeStatusUpdate(dto);
	}

	@Tag(name = "Recipe Master")
	@GetMapping("/recipeViewById/{id}")
	@Observed(name = "recipeViewById", contextualName = "recipeViewById")
	public ResponseDTO<RecipeMasterDTO> recipeViewById(@PathVariable("id") int id) {
		return recipeService.recipeViewById(id);
	}
	@Tag(name = "Recipe Master")
	@GetMapping("/recipeVersionList/{recipePk}")
	@Observed(name = "recipeVersionList", contextualName = "recipeVersionList")
	public ResponseDTO<RecipeMasterListDTO> recipeVersionList(@PathVariable("recipePk") int recipePk) {
		return recipeService.recipeVersionList(recipePk);
	}

	@Tag(name = "Recipe Master")
	@GetMapping("/versionView/{recipePk}/{verNo}")
	@Observed(name = "versionView", contextualName = "versionView")
	public ResponseDTO<RecipeMasterDTO> versionView(@PathVariable("recipePk") int recipePk,
			@PathVariable("verNo") int verNo) {
		return recipeService.versionView(recipePk, verNo);
	}

	@Tag(name = "Recipe Master")
	@GetMapping("/versionCompare/{recipePk}/{verNo}")
	@Observed(name = "versionCompare", contextualName = "versionCompare")
	public ResponseDTO<RecipeMasterDTO> versionCompare(@PathVariable("recipePk") int recipePk,
			@PathVariable("verNo") int verNo) {
		return recipeService.versionCompare(recipePk, verNo);
	}

	@Tag(name = "Recipe Master")
	@PostMapping("/recipeListing")
	@Observed(name = "recipeListing", contextualName = "recipeListing")
	public ResponseDTO<List<RecipeListingDTO>> recipeListing(@RequestBody RecipeListingDTO recipeListingDTO) {
		return recipeService.recipeListing(recipeListingDTO);
	}

	@Tag(name = "Recipe Master")
	@GetMapping("/recipeListView/{id}")
	@Observed(name = "recipeListView", contextualName = "recipeListView")
	public ResponseDTO<RecipeListingDTO> recipeListView(@PathVariable("id") int id) {
		return recipeService.recipeListView(id);
	}

	@Tag(name = "Recipe Master")
	@GetMapping("/loadCountryDropDowm")
	@Observed(name = "loadCountryDropDowm", contextualName = "loadCountryDropDowm")
	public ResponseDTO<List<ComboBoxDTO>> loadCountryDropDowm() {
		return recipeService.loadCountryDropDowm();
	}

	@Tag(name = "Recipe Master")
	@GetMapping("/loadMealTypeDropDown")
	@Observed(name = "loadMealTypeDropDown", contextualName = "loadMealTypeDropDown")
	public ResponseDTO<List<ComboBoxDTO>> loadMealTypeDropDown() {
		return recipeService.loadMealTypeDropDown();
	}

	@Tag(name = "Recipe Master")
	@GetMapping("/loadBaseQuantityDropDown")
	@Observed(name = "loadBaseQuantityDropDown", contextualName = "loadBaseQuantityDropDown")
	public ResponseDTO<List<ComboBoxDTO>> loadBaseQuantityDropDown() {
		return recipeService.loadBaseQuantityDropDown();
	}

	@Tag(name = "Recipe Master")
	@GetMapping("/loadItemCategoryDropDown")
	@Observed(name = "loadItemCategoryDropDown", contextualName = "loadItemCategoryDropDown")
	public ResponseDTO<List<ComboBoxDTO>> loadItemCategoryDropDown() {
		return recipeService.loadItemCategoryDropDown();
	}

	@Tag(name = "Recipe Master")
	@GetMapping("/loadCategoryDropDown")
	@Observed(name = "loadCategoryDropDown", contextualName = "loadCategoryDropDown")
	public ResponseDTO<List<ComboBoxDTO>> loadCategoryDropDown() {
		return recipeService.loadCategoryDropDown();
	}

	@Tag(name = "Recipe Master")
	@GetMapping("/loadItemMasterDropDown/{id}")
	@Observed(name = "loadItemMasterDropDown", contextualName = "loadItemMasterDropDown")
	public ResponseDTO<List<ComboBoxDTO>> loadItemMasterDropDown(@PathVariable("id") int id) {
		return recipeService.loadItemMasterDropDown(id);
	}

	@Tag(name = "Recipe Master")
	@PostMapping(value = "/recipeMasterSave", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	@Observed(name = "recipeMasterSave", contextualName = "recipeMasterSave")
	public ResponseDTO<RecipeMasterDTO> recipeMasterSave(@RequestPart("data") String dataJson,
			@RequestPart(value = "file", required = false) MultipartFile file) throws IOException {

		ObjectMapper mapper = new ObjectMapper();
		RecipeMasterDTO recipeDto = mapper.readValue(dataJson, RecipeMasterDTO.class);

		return recipeService.recipeMasterSave(recipeDto, file);
	}

	@Tag(name = "Recipe Master")
	@GetMapping("/itemList")
	@Observed(name = "itemList", contextualName = "itemList")
	public ResponseDTO<List<RecipeMasterDTO>> itemList() {
		return recipeService.itemList();
	}

	@Tag(name = "Recipe Master")
	@GetMapping("/recipeMasterViewById/{id}")
	@Observed(name = "recipeMasterViewById", contextualName = "recipeMasterViewById")
	public ResponseDTO<RecipeMasterDTO> recipeMasterViewById(@PathVariable("id") int id) {
		return recipeService.recipeMasterViewById(id);
	}
	

	@Tag(name = "Recipe Master")
	@PostMapping(value = "/recipeMasterModify", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	@Observed(name = "recipeMasterModify", contextualName = "recipeMasterModify")
	public ResponseDTO<RecipeMasterDTO> recipeMasterModify(@RequestPart("metadata") String dataJson,
			@RequestPart(value = "file", required = false) MultipartFile file) throws IOException {

		ObjectMapper mapper = new ObjectMapper();
		RecipeMasterDTO recipeDto = mapper.readValue(dataJson, RecipeMasterDTO.class);

		String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
		Path jsonPath = COMMON_JSON_DIR.resolve("recipeMasterModify" + "_" + timestamp + ".json");
		String jsonData = mapper.writerWithDefaultPrettyPrinter().writeValueAsString(dataJson);

		Files.write(jsonPath, jsonData.getBytes(), StandardOpenOption.CREATE, StandardOpenOption.TRUNCATE_EXISTING);

		return recipeService.recipeMasterModify(recipeDto, file);
	}

	@Tag(name = "Recipe Master")
	@PostMapping("/saveRecipeCopy")
	@Observed(name = "saveRecipeCopy", contextualName = "saveRecipeCopy")
	public ResponseDTO<RecipeMasterDTO> saveRecipeCopy(@RequestBody RecipeMasterDTO copy) {
		return recipeService.saveRecipeCopy(copy);
	}

	@Tag(name = "Recipe Master")
	@GetMapping("/printexcelreport/{id}/{userId}")
	@Observed(name = "printexcelreport", contextualName = "printexcelreport")
	public ResponseEntity<byte[]> printexcelreport(@PathVariable("id") int id, @PathVariable("userId") int userId) {
		return recipeService.printexcelreport(id, userId);
	}

	// Meal Mapping
	@Tag(name = "Meal Mapping")
	@PostMapping("/mealList")
	@Observed(name = "mealList", contextualName = "mealList")
	public ResponseDTO<List<RecipeMealMappingDTO>> recipeMealMappingList(
			@RequestBody RecipeMealMappingDTO recipeMasterListDTO) {
		return recipeService.mealList(recipeMasterListDTO);
	}

	@Tag(name = "Meal Mapping")
	@PostMapping("/recipeAvailableList")
	@Observed(name = "recipeAvailableList", contextualName = "recipeAvailableList")
	public ResponseDTO<List<RecipeMealMappingDTO>> recipeAvailableList(
			@RequestBody RecipeMealMappingDTO recipeMasterListDTO) {
		return recipeService.recipeAvailableList(recipeMasterListDTO);
	}

	@Tag(name = "Meal Mapping")
	@PostMapping("/saveRecipeMealMappingMaster")
	@Observed(name = "saveRecipeMealMappingMaster", contextualName = "saveRecipeMealMappingMaster")
	public ResponseDTO<RecipeMealMappingDTO> saveRecipeMealMappingMaster(@RequestBody RecipeMealMappingDTO meal) {
		return recipeService.saveRecipeMealMappingMaster(meal);
	}

	@Tag(name = "Meal Mapping")
	@PostMapping("/inactiveTheMealType")
	@Observed(name = "inactiveTheMealType", contextualName = "inactiveTheMealType")
	public ResponseDTO<RecipeMealMappingDTO> inactiveTheMealType(@RequestBody RecipeMealMappingDTO mealFk) {
		return recipeService.inactiveTheMealType(mealFk);
	}

	// Category Mapping
	@Tag(name = "Category Mapping")
	@PostMapping("/saveCategoryMapping")
	@Observed(name = "saveCategoryMapping", contextualName = "saveCategoryMapping")
	public ResponseDTO<CategoryRecipeMappingDTO> saveCategoryMapping(@RequestBody CategoryRecipeMappingDTO meal) {
		return recipeService.saveCategoryMapping(meal);
	}

	@Tag(name = "Category Mapping")
	@PostMapping("/inactiveTheCategory")
	@Observed(name = "inactiveTheCategory", contextualName = "inactiveTheCategory")
	public ResponseDTO<CategoryRecipeMappingDTO> inactiveTheCategory(@RequestBody CategoryRecipeMappingDTO mealFk) {
		return recipeService.inactiveTheCategory(mealFk);
	}

	@Tag(name = "Category Mapping")
	@PostMapping("/availableCategoryList")
	@Observed(name = "availableCategoryList", contextualName = "availableCategoryList")
	public ResponseDTO<List<CategoryRecipeMappingDTO>> availableCategoryList(
			@RequestBody CategoryRecipeMappingDTO recipeMasterListDTO) {
		return recipeService.availableCategoryList(recipeMasterListDTO);
	}

	@Tag(name = "Category Mapping")
	@PostMapping("/categoryMappedList")
	@Observed(name = "categoryMappedList", contextualName = "categoryMappedList")
	public ResponseDTO<List<CategoryRecipeMappingDTO>> categoryMappedList(@RequestBody CategoryRecipeMappingDTO meal) {
		return recipeService.categoryMappedList(meal);
	}

	@Tag(name = "Category Mapping")
	@PostMapping("/checkCode")
	@Observed(name = "checkCode", contextualName = "checkCode")
	public ResponseDTO<RecipeMasterDTO> checkCode(@RequestBody RecipeMasterDTO dto) {
		return recipeService.checkCode(dto);
	}

}
