package esfita.service;

import java.io.ByteArrayOutputStream;
import java.io.Serializable;
import java.text.DecimalFormat;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.apache.poi.hssf.usermodel.HSSFWorkbook;
import org.apache.poi.ss.usermodel.BorderStyle;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.FillPatternType;
import org.apache.poi.ss.usermodel.Font;
import org.apache.poi.ss.usermodel.HorizontalAlignment;
import org.apache.poi.ss.usermodel.IndexedColors;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import esfita.dto.ComboBoxDTO;
import esfita.dto.MenuSimulationDTO;
import esfita.dto.ResponseDTO;
import esfita.entity.CountryMasterHib;
import esfita.entity.ItemCategoryMasterHib;
import esfita.entity.MstCategoryMasterHib;
import esfita.entity.RecipeCategoryMappingHib;
import esfita.entity.RecipeDHib;
import esfita.entity.RecipeHHib;
import esfita.entity.RecipeMealMappingHib;
import esfita.entity.RecipeMealMasterHib;
import esfita.repository.CountryMasterRepository;
import esfita.repository.ItemCategoryMasterRepository;
import esfita.repository.MstCategoryMasterRepository;
import esfita.repository.RecipeCategoryMappingRepository;
import esfita.repository.RecipeDRepository;
import esfita.repository.RecipeHRepository;
import esfita.repository.RecipeMealMappingRepository;
import esfita.repository.RecipeMealMasterRepository;
import esfita.utils.AppConstants;
import esfita.utils.RestException;
import lombok.extern.log4j.Log4j2;

@Service
@Log4j2
public class MenuSimulationService implements Serializable {

	/**
	 * 
	 */
	private static final long serialVersionUID = 9000027169962356165L;
	private static final Logger log = LoggerFactory.getLogger(MenuSimulationService.class);

	private final transient RecipeMealMasterRepository recipeMealMasterRepository;
	private final transient MstCategoryMasterRepository mstCategoryMasterRepository;
	private final transient RecipeMealMappingRepository recipeMealMappingRepository;
	private final transient RecipeCategoryMappingRepository recipeCategoryMappingRepository;
	private final transient CountryMasterRepository countryMasterRepository;
	private final transient RecipeHRepository recipeHRepository;
	private final transient RecipeDRepository recipeDRepository;
	private final transient ItemCategoryMasterRepository itemCategoryMasterRepository;

	public MenuSimulationService(RecipeMealMasterRepository recipeMealMasterRepository,
			MstCategoryMasterRepository mstCategoryMasterRepository,
			RecipeMealMappingRepository recipeMealMappingRepository,
			RecipeCategoryMappingRepository recipeCategoryMappingRepository,
			CountryMasterRepository countryMasterRepository, RecipeHRepository recipeHRepository,
			RecipeDRepository recipeDRepository, ItemCategoryMasterRepository itemCategoryMasterRepository) {

		this.recipeMealMasterRepository = recipeMealMasterRepository;
		this.mstCategoryMasterRepository = mstCategoryMasterRepository;
		this.recipeMealMappingRepository = recipeMealMappingRepository;
		this.recipeCategoryMappingRepository = recipeCategoryMappingRepository;
		this.countryMasterRepository = countryMasterRepository;
		this.recipeHRepository = recipeHRepository;
		this.recipeDRepository = recipeDRepository;
		this.itemCategoryMasterRepository = itemCategoryMasterRepository;
	}

	public ResponseDTO<List<MenuSimulationDTO>> recipeList(MenuSimulationDTO recipeListingDTO) {
		ResponseDTO<List<MenuSimulationDTO>> response = new ResponseDTO<>();
		List<MenuSimulationDTO> recipeListing = new ArrayList<>();
		try {
			Integer category = recipeListingDTO.getCategoryFk();
			category = (category != null && category == 0) ? null : category;

			// 1. Fetch all recipes
			List<RecipeHHib> recipeList = recipeHRepository.filterRecipeEnquiry(category);
			if (recipeList == null || recipeList.isEmpty()) {
				response.setSuccess(AppConstants.FALSE);
				response.setMessage(AppConstants.ISEMPTY);
				return response;
			}

			// 2. Fetch all necessary related data in bulk
			List<ItemCategoryMasterHib> catHIB = itemCategoryMasterRepository.findAll();
			Map<String, String> catGroupMap = catHIB.stream().collect(Collectors
					.toMap(cat -> cat.getCategoryName().toLowerCase(), ItemCategoryMasterHib::getCategoryGroup));

			List<Integer> recipeIds = recipeList.stream().map(RecipeHHib::getId).toList();

			List<CountryMasterHib> countries = countryMasterRepository.findAll();
			Map<Integer, CountryMasterHib> countryMap = countries.stream()
					.collect(Collectors.toMap(CountryMasterHib::getId, c -> c));

			List<RecipeCategoryMappingHib> catMappings = recipeCategoryMappingRepository.findByRecipeFkIn(recipeIds);
			Map<Integer, List<RecipeCategoryMappingHib>> recipeCatMap = catMappings.stream()
					.collect(Collectors.groupingBy(RecipeCategoryMappingHib::getRecipeFk));

			List<MstCategoryMasterHib> mstCategoryMasters = mstCategoryMasterRepository.findAll();
			Map<Integer, MstCategoryMasterHib> mstCategoryMap = mstCategoryMasters.stream()
					.collect(Collectors.toMap(MstCategoryMasterHib::getId, c -> c));

			List<RecipeMealMappingHib> mealMappings = recipeMealMappingRepository.findByRecipeFkIn(recipeIds);
			Map<Integer, List<RecipeMealMappingHib>> recipeMealMap = mealMappings.stream()
					.collect(Collectors.groupingBy(RecipeMealMappingHib::getRecipeFk));

			List<Integer> mealIds = mealMappings.stream().map(RecipeMealMappingHib::getMealFk).toList();
			List<RecipeMealMasterHib> mealMasters = recipeMealMasterRepository.findAllById(mealIds);
			Map<Integer, RecipeMealMasterHib> mealMasterMap = mealMasters.stream()
					.collect(Collectors.toMap(RecipeMealMasterHib::getId, m -> m));

			List<RecipeDHib> ingredients = recipeDRepository.findByRecipeFkIn(recipeIds);
			Map<Integer, List<RecipeDHib>> recipeIngMap = ingredients.stream()
					.collect(Collectors.groupingBy(RecipeDHib::getRecipeFk));

			// 3. Build DTOs in memory
			for (RecipeHHib hib : recipeList) {
				MenuSimulationDTO dto = new MenuSimulationDTO();
				dto.setId(hib.getId());
				dto.setRecipeName(hib.getRecipeName());
				dto.setServings(hib.getFinishedProduct());
				dto.setPortionSize(hib.getPortionSize());
				dto.setPerPortionCost(hib.getPerPortionCost());
				dto.setUom(hib.getUom());
				dto.setBaseQuantity(hib.getBaseQuantity());

				CountryMasterHib country = countryMap.get(hib.getCountryOriginFk());
				dto.setCuisineName(country != null ? country.getCountryName() : "N/A");

				// Category List
				List<MenuSimulationDTO> categoryList = recipeCatMap.getOrDefault(hib.getId(), Collections.emptyList())
						.stream().map(chib -> {
							MenuSimulationDTO cdto = new MenuSimulationDTO();
							MstCategoryMasterHib caHib = mstCategoryMap.get(chib.getCategoryFk());
							cdto.setCategoryName(caHib != null ? caHib.getCategoryName() : "");
							cdto.setCategoryFk(chib.getCategoryFk());
							return cdto;
						}).toList();
				dto.setCategoryList(categoryList);

				// Meal List
				List<MenuSimulationDTO> mealList = recipeMealMap.getOrDefault(hib.getId(), Collections.emptyList())
						.stream().map(mhib -> {
							MenuSimulationDTO mdto = new MenuSimulationDTO();
							RecipeMealMasterHib meHib = mealMasterMap.get(mhib.getMealFk());
							mdto.setMealName(meHib != null ? meHib.getRecipeMealName() : "");
							return mdto;
						}).toList();
				dto.setMealList(mealList);

				List<MenuSimulationDTO> ingList = recipeIngMap.getOrDefault(hib.getId(), Collections.emptyList())
						.stream().map(hib1 -> {
							MenuSimulationDTO dto1 = new MenuSimulationDTO();
							dto1.setRecipeFk(hib1.getRecipeFk());

							// Safe categoryFk
							Integer catFk = (hib1.getCategoryFk() != null) ? hib1.getCategoryFk() : 0;
							dto1.setCategoryFk(catFk);

							// Safe categoryName
							String categoryName = hib1.getCategoryName();
							dto1.setItemCategoryName(categoryName != null ? categoryName : "N/A");
							dto1.setMainCategory(categoryName != null
									? catGroupMap.getOrDefault(categoryName.toLowerCase(), categoryName)
									: "N/A");

							dto1.setItemFk(hib1.getItemFk() != 0 ? hib1.getItemFk() : 0);
							dto1.setItemName(hib1.getItemName() != null ? hib1.getItemName() : "N/A");
							dto1.setItemCode(hib1.getItemCode() != null ? hib1.getItemCode() : "N/A");
							dto1.setPackageId(hib1.getPackageId());
							dto1.setPackagePrice(hib1.getPackagePrice() != null ? hib1.getPackagePrice() : 0);
							dto1.setPackageBaseUnit(
									hib1.getPackageBaseUnit() != null ? hib1.getPackageBaseUnit() : "N/A");
							dto1.setPackageSecondaryUnit(
									hib1.getPackageSecondaryUnit() != null ? hib1.getPackageSecondaryUnit() : "N/A");
							dto1.setPackageBaseFactor(
									hib1.getPackageBaseFactor() != null ? hib1.getPackageBaseFactor() : 0);
							dto1.setPackageSecondaryFactor(
									hib1.getPackageSecondaryFactor() != null ? hib1.getPackageSecondaryFactor() : 0);
							dto1.setPackageSecondaryCost(
									hib1.getPackageSecondaryCost() != null ? hib1.getPackageSecondaryCost() : 0);
							dto1.setChefUnit(dto1.getPackageSecondaryUnit());
							dto1.setCostPrice(dto1.getPackageSecondaryCost());

							// Safe calculations
							dto1.setBaseQuantity(
									hib1.getBaseQuantity() != null ? hib1.getBaseQuantity() / hib.getBaseQuantity()
											: 0);
							dto1.setSecondaryQuantity(hib1.getSecondaryQuantity() != null
									? hib1.getSecondaryQuantity() / hib.getBaseQuantity()
									: 0);
							dto1.setTotalCost(hib1.getTotal() != null ? hib1.getTotal() / hib.getBaseQuantity() : 0);

							return dto1;
						}).toList();

				dto.setIngList(ingList);

				recipeListing.add(dto);
			}

			response.setData(recipeListing);
			response.setSuccess(AppConstants.TRUE);
			response.setMessage(AppConstants.MSG_RECORD_FETCHED);
			log.info("<----Recipe Details fetched Successfully, No of records-->: {}", recipeListing.size());

		} catch (RestException re) {
			response.setSuccess(AppConstants.FALSE);
			log.warn(AppConstants.REST_EXCEPTION + " Recipe list", re);
		} catch (Exception e) {
			response.setSuccess(AppConstants.FALSE);
			log.error(AppConstants.EXCEPTION + " Recipe list", e);
		}
		return response;
	}

	public ResponseEntity<byte[]> exportMenuSimulationExcel(MenuSimulationDTO menuSimulation) {
		try (Workbook workbook = new HSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {

			// Create cell styles
			CellStyle headerStyle = createHeaderStyle(workbook);
			CellStyle boldStyle = createBoldStyle(workbook);
			CellStyle currencyStyle = createCurrencyStyle(workbook);
			CellStyle numberStyle = createNumberStyle(workbook);

			// Create sheets
			createSummarySheet(workbook, headerStyle, boldStyle, currencyStyle, menuSimulation);
			createMealTypeSheet(workbook, headerStyle, boldStyle, currencyStyle, numberStyle, menuSimulation);
			createItemListSheet(workbook, headerStyle, currencyStyle, numberStyle, menuSimulation);

			// Write workbook to output stream
			workbook.write(out);
			byte[] excelBytes = out.toByteArray();

			// Set response headers
			HttpHeaders headers = new HttpHeaders();
			headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
			headers.setContentDispositionFormData("attachment", "MenuSimulationReport_"
					+ new java.text.SimpleDateFormat("yyyyMMddHHmmss").format(new Date()) + ".xls");

			return new ResponseEntity<>(excelBytes, headers, HttpStatus.OK);

		} catch (Exception e) {
			log.error("Failed to generate Menu Simulation Report", e);
			return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	// ======================
	// Styles
	// ======================
	public CellStyle createHeaderStyle(Workbook workbook) {
		CellStyle style = workbook.createCellStyle();
		Font font = workbook.createFont();
		font.setBold(true);
		font.setColor(IndexedColors.WHITE.getIndex());
		style.setFont(font);
		style.setFillForegroundColor(IndexedColors.DARK_BLUE.getIndex());
		style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
		style.setBorderBottom(BorderStyle.THIN);
		style.setBorderTop(BorderStyle.THIN);
		style.setBorderLeft(BorderStyle.THIN);
		style.setBorderRight(BorderStyle.THIN);
		style.setAlignment(HorizontalAlignment.CENTER);
		return style;
	}

	private CellStyle createBoldStyle(Workbook workbook) {
		CellStyle style = workbook.createCellStyle();
		Font font = workbook.createFont();
		font.setBold(true);
		font.setColor(IndexedColors.BLUE.getIndex());
		style.setFont(font);
		return style;
	}

	private CellStyle createCurrencyStyle(Workbook workbook) {
		CellStyle style = workbook.createCellStyle();
		style.setDataFormat(workbook.createDataFormat().getFormat("#,##0.00"));
		return style;
	}

	private CellStyle createNumberStyle(Workbook workbook) {
		CellStyle style = workbook.createCellStyle();
		style.setDataFormat(workbook.createDataFormat().getFormat("0.00"));
		return style;
	}

	// ======================
	// Sheets
	// ======================
	private void createSummarySheet(Workbook workbook, CellStyle headerStyle, CellStyle boldStyle,
			CellStyle currencyStyle, MenuSimulationDTO menuSimulation) {

		Sheet sheet = workbook.createSheet("Summary Details");
		int rowNum = 0;

		// Title
		Row titleRow = sheet.createRow(rowNum++);
		Cell titleCell = titleRow.createCell(0);
		titleCell.setCellValue("Menu Simulation Summary Report");
		titleCell.setCellStyle(boldStyle);

		rowNum++;

		// Summary Data
		double perPersonCost = menuSimulation.getTotalCost();
		double totalCostValue = menuSimulation.getTotalCost() * menuSimulation.getPob();
		int totalItems = menuSimulation.getItemCount();
		int totalCategories = menuSimulation.getCategoriesCount();

		String[][] summaryData = { { "Per Person Cost", formatCost(perPersonCost) },
				{ "Total Cost", formatCost(totalCostValue) }, { "Total Item Count", String.valueOf(totalItems) },
				{ "Total Item Categories", String.valueOf(totalCategories) },
				{ "POB Value", String.valueOf(menuSimulation.getPob()) } };

		// Header Row
		Row headerRow = sheet.createRow(rowNum++);
		String[] headers = { "Metric", "Value" };
		for (int i = 0; i < headers.length; i++) {
			Cell cell = headerRow.createCell(i);
			cell.setCellValue(headers[i]);
			cell.setCellStyle(headerStyle);
		}

		// Data Rows
		for (String[] data : summaryData) {
			Row row = sheet.createRow(rowNum++);
			row.createCell(0).setCellValue(data[0]);
			if (data[0].contains("Cost")) {
				try {
					double value = Double.parseDouble(data[1].replace(",", ""));
					Cell cell = row.createCell(1);
					cell.setCellValue(value);
					cell.setCellStyle(currencyStyle);
				} catch (NumberFormatException e) {
					row.createCell(1).setCellValue(data[1]);
				}
			} else {
				row.createCell(1).setCellValue(data[1]);
			}
		}

		for (int i = 0; i < headers.length; i++)
			sheet.autoSizeColumn(i);
	}

	private void createMealTypeSheet(Workbook workbook, CellStyle headerStyle, CellStyle boldStyle,
			CellStyle currencyStyle, CellStyle numberStyle, MenuSimulationDTO menuSimulation) {

		Sheet sheet = workbook.createSheet("Meal Type Details");
		int rowNum = 0;

		if (menuSimulation.getMealTypeList() != null) {
			for (MenuSimulationDTO mealType : menuSimulation.getMealTypeList()) {
				Row mealHeaderRow = sheet.createRow(rowNum++);
				Cell mealHeaderCell = mealHeaderRow.createCell(0);
				mealHeaderCell.setCellValue(
						mealType.getMealTypeName() + " - Total Cost: " + formatCost(mealType.getTotalCost()));
				mealHeaderCell.setCellStyle(boldStyle);

				// Recipe Header
				Row recipeHeaderRow = sheet.createRow(rowNum++);
				String[] recipeHeaders = { "Category", "Recipe Name", "Ideal Portion", "UOM", "Cost/Portion",
						"POB Participation %", "Final Cost" };
				for (int i = 0; i < recipeHeaders.length; i++) {
					Cell cell = recipeHeaderRow.createCell(i);
					cell.setCellValue(recipeHeaders[i]);
					cell.setCellStyle(headerStyle);
				}

				if (mealType.getRecipes() != null) {
					for (MenuSimulationDTO recipe : mealType.getRecipes()) {
						Row recipeRow = sheet.createRow(rowNum++);
						recipeRow.createCell(0).setCellValue(recipe.getCategoryName());
						recipeRow.createCell(1).setCellValue(recipe.getRecipeName());

						Cell portionCell = recipeRow.createCell(2);
						portionCell.setCellValue(recipe.getPortionSize());
						portionCell.setCellStyle(numberStyle);

						recipeRow.createCell(3).setCellValue(recipe.getUom());

						Cell costCell = recipeRow.createCell(4);
						costCell.setCellValue(recipe.getPerPortionCost());
						costCell.setCellStyle(currencyStyle);

						Cell pobCell = recipeRow.createCell(5);
						pobCell.setCellValue(recipe.getPobParticipation());
						pobCell.setCellStyle(numberStyle);

						Cell finalCostCell = recipeRow.createCell(6);
						double finalCost = recipe.getPerPortionCost()
								* (menuSimulation.getPob() * recipe.getPobParticipation() / 100.0);
						finalCostCell.setCellValue(finalCost);
						finalCostCell.setCellStyle(currencyStyle);
					}
				}

				// Meal summary
				Row summaryRow = sheet.createRow(rowNum++);
				summaryRow.createCell(0).setCellValue("Total Recipes: ");
				summaryRow.createCell(1).setCellValue(mealType.getRecipes() != null ? mealType.getRecipes().size() : 0);

				Row costSummaryRow = sheet.createRow(rowNum++);
				costSummaryRow.createCell(0).setCellValue("Final Meal Cost: ");
				Cell totalCostCell = costSummaryRow.createCell(1);
				totalCostCell.setCellValue(mealType.getTotalCost());
				totalCostCell.setCellStyle(currencyStyle);

				rowNum += 2;
			}
		} else {
			Row noDataRow = sheet.createRow(rowNum);
			noDataRow.createCell(0).setCellValue("No meal type data available");
		}

		for (int i = 0; i < 7; i++)
			sheet.autoSizeColumn(i);
	}

	private void createItemListSheet(Workbook workbook, CellStyle headerStyle, CellStyle currencyStyle,
			CellStyle numberStyle, MenuSimulationDTO menuSimulation) {

		Sheet sheet = workbook.createSheet("Item List");
		int rowNum = 0;

		String[] headers = { "Category", "Item Code", "Item Name", "Package ID", "Package Price", "Base Factor",
				"Base Unit", "Secondary Factor", "Secondary Unit", "Secondary Cost", "Base Quantity",
				"Secondary Quantity", "Total Cost" };

		Row headerRow = sheet.createRow(rowNum++);
		for (int i = 0; i < headers.length; i++) {
			Cell cell = headerRow.createCell(i);
			cell.setCellValue(headers[i]);
			cell.setCellStyle(headerStyle);
		}

		if (menuSimulation.getItemList() != null) {
			for (MenuSimulationDTO item : menuSimulation.getItemList()) {
				Row row = sheet.createRow(rowNum++);
				row.createCell(0).setCellValue(item.getItemCategoryName());
				row.createCell(1).setCellValue(item.getItemCode());
				row.createCell(2).setCellValue(item.getItemName());
				row.createCell(3).setCellValue(item.getPackageId());

				Cell packagePriceCell = row.createCell(4);
				packagePriceCell.setCellValue(item.getPackagePrice());
				packagePriceCell.setCellStyle(currencyStyle);

				Cell baseFactorCell = row.createCell(5);
				baseFactorCell.setCellValue(item.getPackageBaseFactor());
				baseFactorCell.setCellStyle(numberStyle);

				row.createCell(6).setCellValue(item.getPackageBaseUnit());

				Cell secFactorCell = row.createCell(7);
				secFactorCell.setCellValue(item.getPackageSecondaryFactor());
				secFactorCell.setCellStyle(numberStyle);

				row.createCell(8).setCellValue(item.getPackageSecondaryUnit());

				Cell secondaryCostCell = row.createCell(9);
				secondaryCostCell.setCellValue(item.getPackageSecondaryCost());
				secondaryCostCell.setCellStyle(currencyStyle);

				Cell baseQtyCell = row.createCell(10);
				baseQtyCell.setCellValue(item.getBaseQuantity());
				baseQtyCell.setCellStyle(numberStyle);

				Cell secondaryQtyCell = row.createCell(11);
				secondaryQtyCell.setCellValue(item.getSecondaryQuantity());
				secondaryQtyCell.setCellStyle(numberStyle);

				Cell totalCostCell = row.createCell(12);
				totalCostCell.setCellValue(item.getTotalCost() * menuSimulation.getPob());
				totalCostCell.setCellStyle(currencyStyle);
			}
		} else {
			Row noDataRow = sheet.createRow(rowNum);
			noDataRow.createCell(0).setCellValue("No item data available");
		}

		for (int i = 0; i < headers.length; i++)
			sheet.autoSizeColumn(i);
	}

	private String formatCost(double cost) {
		try {
			DecimalFormat formatter = new DecimalFormat("#,##0.00");
			return formatter.format(cost);
		} catch (Exception e) {
			return "0.00";
		}
	}

	public ResponseDTO<List<ComboBoxDTO>> loadMealTypeDropDown() {
		ResponseDTO<List<ComboBoxDTO>> response = new ResponseDTO<>();
		List<ComboBoxDTO> comboList = new ArrayList<>();
		try {
			List<RecipeMealMasterHib> mealMASTERHIB = recipeMealMasterRepository.orderBy();
			if (mealMASTERHIB != null) {
				for (RecipeMealMasterHib hib : mealMASTERHIB) {
					ComboBoxDTO dto = new ComboBoxDTO();
					dto.setPk(hib.getId());
					dto.setName(hib.getRecipeMealName());
					dto.setCode(hib.getRecipeMealCode());
					comboList.add(dto);
					response.setSuccess(AppConstants.TRUE);
				}
			} else {
				response.setSuccess(AppConstants.FALSE);
				response.setMessage(AppConstants.E_DATA);
			}

			response.setData(comboList);
		} catch (RestException re) {
			response.setSuccess(AppConstants.FALSE);
			log.warn(AppConstants.REST_EXCEPTION + "Recipe Meal Name", re);
		} catch (Exception e) {
			response.setSuccess(AppConstants.FALSE);
			log.error(AppConstants.EXCEPTION + " Recipe Meal Name", e);
		}
		return response;
	}

	public ResponseDTO<List<ComboBoxDTO>> loadCategoryDropDown() {
		ResponseDTO<List<ComboBoxDTO>> response = new ResponseDTO<>();
		List<ComboBoxDTO> comboList = new ArrayList<>();
		try {
			List<MstCategoryMasterHib> mHIB = mstCategoryMasterRepository.orderBy();
			if (mHIB != null && !mHIB.isEmpty()) {
				for (MstCategoryMasterHib hib : mHIB) {
					ComboBoxDTO dto = new ComboBoxDTO();
					dto.setPk(hib.getId());
					dto.setName(hib.getCategoryName());
					dto.setCode(hib.getCategoryCode());
					comboList.add(dto);
				}

			} else {
				response.setSuccess(AppConstants.FALSE);
				response.setMessage(AppConstants.E_DATA);
			}
			response.setSuccess(AppConstants.TRUE);
			response.setData(comboList);
		} catch (RestException re) {
			response.setSuccess(AppConstants.FALSE);
			log.warn(AppConstants.REST_EXCEPTION + "Item Category List", re);
		} catch (Exception e) {
			response.setSuccess(AppConstants.FALSE);
			log.error(AppConstants.EXCEPTION + "Item Category List", e);
		}
		return response;
	}
}
