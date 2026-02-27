package esfita.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import esfita.common.ResponseDTO;
import esfita.dto.BasePortionQuantityMasterDTO;
import esfita.dto.CategoryMasterDTO;
import esfita.dto.CountryMasterDTO;
import esfita.dto.ItemCategoryMasterDTO;
import esfita.dto.RecipeMealMasterDTO;
import esfita.service.MasterService;
import io.micrometer.observation.annotation.Observed;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/mMSMasterController")
public class MasterController {

	@Autowired
	MasterService mmsMasterService;

	// Recipe Meal Master
	@Tag(name = "Recipe Meal Master")
	@PostMapping("/saveRecipeMealMaster")
	@Observed(name = "saveRecipeMealMaster", contextualName = "saveRecipeMealMaster")
	public ResponseDTO<RecipeMealMasterDTO> saveRecipeMealMaster(@RequestBody RecipeMealMasterDTO dto) {
		return mmsMasterService.saveRecipeMealMaster(dto);
	}

	@Tag(name = "Recipe Meal Master")
	@GetMapping("/recipeMealMasterList")
	@Observed(name = "recipeMealMasterList", contextualName = "recipeMealMasterList")
	public ResponseDTO<List<RecipeMealMasterDTO>> recipeMealMasterList() {
		return mmsMasterService.recipeMealMasterList();
	}

	@Tag(name = "Recipe Meal Master")
	@GetMapping("/recipeMealView/{id}")
	@Observed(name = "recipeMealView", contextualName = "recipeMealView")
	public ResponseDTO<RecipeMealMasterDTO> recipeMealView(@PathVariable int id) {
		return mmsMasterService.recipeMealView(id);
	}

	@Tag(name = "Recipe Meal Master")
	@PostMapping("/recipeMealModify")
	@Observed(name = "recipeMealModify", contextualName = "recipeMealModify")
	public ResponseDTO<RecipeMealMasterDTO> recipeMealModify(@RequestBody RecipeMealMasterDTO selectView) {
		return mmsMasterService.recipeMealModify(selectView);
	}

	@Tag(name = "Recipe Meal Master")
	@PostMapping("/recipeMealStatusUpdate")
	@Observed(name = "recipeMealStatusUpdate", contextualName = "recipeMealStatusUpdate")
	public ResponseDTO<RecipeMealMasterDTO> recipeMealStatusUpdate(@RequestBody RecipeMealMasterDTO dto) {
		return mmsMasterService.recipeMealStatusUpdate(dto);
	}

	@Tag(name = "Recipe Meal Master")
	@PostMapping("/checkCode")
	@Observed(name = "checkCode", contextualName = "checkCode")
	public ResponseDTO<RecipeMealMasterDTO> checkCode(@RequestBody RecipeMealMasterDTO dto) {
		return mmsMasterService.checkCode(dto);
	}

	// Country Master
	@Tag(name = "Country Master")
	@PostMapping("/countryMasterSave")
	@Observed(name = "countryMasterSave", contextualName = "countryMasterSave")
	public ResponseDTO<CountryMasterDTO> countryMasterSave(@RequestBody CountryMasterDTO dto) {
		return mmsMasterService.countryMasterSave(dto);
	}

	@Tag(name = "Country Master")
	@GetMapping("/countryMasterList")
	@Observed(name = "countryMasterList", contextualName = "countryMasterList")
	public ResponseDTO<List<CountryMasterDTO>> countryMasterList() {
		return mmsMasterService.countryMasterList();
	}

	@Tag(name = "Country Master")
	@GetMapping("/countryView/{id}")
	@Observed(name = "countryView", contextualName = "countryView")
	public ResponseDTO<CountryMasterDTO> countryView(@PathVariable int id) {
		return mmsMasterService.countryView(id);
	}

	@Tag(name = "Country Master")
	@PostMapping("/countryModify")
	@Observed(name = "countryModify", contextualName = "countryModify")
	public ResponseDTO<CountryMasterDTO> countryModify(@RequestBody CountryMasterDTO selectView) {
		return mmsMasterService.countryModify(selectView);
	}

	@Tag(name = "Country Master")
	@PostMapping("/countryStatusUpdate")
	@Observed(name = "countryStatusUpdate", contextualName = "countryStatusUpdate")
	public ResponseDTO<CountryMasterDTO> countryStatusUpdate(@RequestBody CountryMasterDTO dto) {
		return mmsMasterService.countryStatusUpdate(dto);
	}

	@Tag(name = "Country Master")
	@PostMapping("/checkCountryCode")
	@Observed(name = "checkCountryCode", contextualName = "checkCountryCode")
	public ResponseDTO<CountryMasterDTO> checkCountryCode(@RequestBody CountryMasterDTO dto) {
		return mmsMasterService.checkCountryCode(dto);
	}

	// Item Category Master
	@Tag(name = "Item Category Master")
	@PostMapping("/itemCatagoryMasterSave")
	@Observed(name = "itemCatagoryMasterSave", contextualName = "itemCatagoryMasterSave")
	public ResponseDTO<ItemCategoryMasterDTO> itemCatagoryMasterSave(
			@RequestBody ItemCategoryMasterDTO itemCategoryMasterDTO) {
		return mmsMasterService.itemCategoryMasterSave(itemCategoryMasterDTO);
	}

	@Tag(name = "Item Category Master")
	@GetMapping("/itemCategoryMasterList")
	@Observed(name = "itemCategoryMasterList", contextualName = "itemCategoryMasterList")
	public ResponseDTO<List<ItemCategoryMasterDTO>> itemCatagoryMasterList() {
		return mmsMasterService.itemCategoryMasterList();
	}

	@Tag(name = "Item Category Master")
	@GetMapping("/itemCategoryViewById/{id}")
	@Observed(name = "itemCategoryViewById", contextualName = "itemCategoryViewById")
	public ResponseDTO<ItemCategoryMasterDTO> itemCatagoryViewById(@PathVariable int id) {
		return mmsMasterService.itemCategoryViewById(id);
	}

	@Tag(name = "Item Category Master")
	@PostMapping("/itemCategoryStatusUpdate")
	@Observed(name = "itemCategoryStatusUpdate", contextualName = "itemCategoryStatusUpdate")
	public ResponseDTO<ItemCategoryMasterDTO> itemCatagoryStatusUpdate(@RequestBody ItemCategoryMasterDTO itemDTO) {
		return mmsMasterService.itemCatagoryStatusUpdate(itemDTO);
	}

	@Tag(name = "Item Category Master")
	@PostMapping("/itemCategoryMasterModify")
	@Observed(name = "itemCategoryMasterModify", contextualName = "itemCategoryMasterModify")
	public ResponseDTO<ItemCategoryMasterDTO> itemCatagoryMasterModify(@RequestBody ItemCategoryMasterDTO selectView) {
		return mmsMasterService.itemCatagoryMasterModify(selectView);
	}

	@Tag(name = "Item Category Master")
	@PostMapping("/checkByCode")
	@Observed(name = "checkByCode", contextualName = "checkByCode")
	public ResponseDTO<ItemCategoryMasterDTO> checkByCode(@RequestBody ItemCategoryMasterDTO itemDTO) {
		return mmsMasterService.checkByCode(itemDTO);
	}

	// Base Portion Quantity Master
	@Tag(name = "Base Portion Quantity Master")
	@PostMapping("/saveBasePortionQuantityMaster")
	@Observed(name = "saveBasePortionQuantityMaster", contextualName = "saveBasePortionQuantityMaster")
	public ResponseDTO<BasePortionQuantityMasterDTO> saveBasePortionQuantityMaster(
			@RequestBody BasePortionQuantityMasterDTO dto) {
		return mmsMasterService.saveBasePortionQuantityMaster(dto);
	}

	@Tag(name = "Base Portion Quantity Master")
	@GetMapping("/basePortionQuantityMasterList")
	@Observed(name = "basePortionQuantityMasterList", contextualName = "basePortionQuantityMasterList")
	public ResponseDTO<List<BasePortionQuantityMasterDTO>> basePortionQuantityMasterList() {
		return mmsMasterService.basePortionQuantityMasterList();
	}

	@Tag(name = "Base Portion Quantity Master")
	@GetMapping("/basePortionQuantityMasterView/{id}")
	@Observed(name = "basePortionQuantityMasterView", contextualName = "basePortionQuantityMasterView")
	public ResponseDTO<BasePortionQuantityMasterDTO> basePortionQuantityMasterView(@PathVariable int id) {
		return mmsMasterService.basePortionQuantityMasterView(id);
	}

	@Tag(name = "Base Portion Quantity Master")
	@PostMapping("/basePortionQuantityModify")
	@Observed(name = "basePortionQuantityModify", contextualName = "basePortionQuantityModify")
	public ResponseDTO<BasePortionQuantityMasterDTO> basePortionQuantityModify(
			@RequestBody BasePortionQuantityMasterDTO selectView) {
		return mmsMasterService.basePortionQuantityModify(selectView);
	}

	@Tag(name = "Base Portion Quantity Master")
	@PostMapping("/basePortionQuantityStatusUpdate")
	@Observed(name = "basePortionQuantityStatusUpdate", contextualName = "basePortionQuantityStatusUpdate")
	public ResponseDTO<BasePortionQuantityMasterDTO> basePortionQuantityStatusUpdate(
			@RequestBody BasePortionQuantityMasterDTO dto) {
		return mmsMasterService.basePortionQuantityStatusUpdate(dto);
	}

	@Tag(name = "Base Portion Quantity Master")
	@PostMapping("/checkQty")
	@Observed(name = "checkQty", contextualName = "checkQty")
	public ResponseDTO<BasePortionQuantityMasterDTO> checkQty(@RequestBody BasePortionQuantityMasterDTO dto) {
		return mmsMasterService.checkQty(dto);
	}

	// Category Master
	@Tag(name = "Category Master")
	@PostMapping("/catagoryMasterSave")
	@Observed(name = "catagoryMasterSave", contextualName = "catagoryMasterSave")
	public ResponseDTO<CategoryMasterDTO> catagoryMasterSave(@RequestBody CategoryMasterDTO categoryMasterDTO) {
		return mmsMasterService.categoryMasterSave(categoryMasterDTO);
	}

	@Tag(name = "Category Master")
	@GetMapping("/categoryMasterList")
	@Observed(name = "categoryMasterList", contextualName = "categoryMasterList")
	public ResponseDTO<List<CategoryMasterDTO>> catagoryMasterList() {
		return mmsMasterService.categoryMasterList();
	}

	@Tag(name = "Category Master")
	@GetMapping("/categoryViewById/{id}")
	@Observed(name = "categoryViewById", contextualName = "categoryViewById")
	public ResponseDTO<CategoryMasterDTO> catagoryViewById(@PathVariable int id) {
		return mmsMasterService.categoryViewById(id);
	}

	@Tag(name = "Category Master")
	@PostMapping("/categoryStatusUpdate")
	@Observed(name = "categoryStatusUpdate", contextualName = "categoryStatusUpdate")
	public ResponseDTO<CategoryMasterDTO> catagoryStatusUpdate(@RequestBody CategoryMasterDTO categoryDTO) {
		return mmsMasterService.categoryStatusUpdate(categoryDTO);
	}

	@Tag(name = "Category Master")
	@PostMapping("/categoryMasterModify")
	@Observed(name = "categoryMasterModify", contextualName = "categoryMasterModify")
	public ResponseDTO<CategoryMasterDTO> catagoryMasterModify(@RequestBody CategoryMasterDTO selectView) {
		return mmsMasterService.categoryMasterModify(selectView);
	}

	@Tag(name = "Category Master")
	@PostMapping("/checkByCategoryCode")
	@Observed(name = "checkByCategoryCode", contextualName = "checkByCategoryCode")
	public ResponseDTO<CategoryMasterDTO> checkByCategoryCode(@RequestBody CategoryMasterDTO categoryDTO) {
		return mmsMasterService.checkByCategoryCode(categoryDTO);
	}

}
