package esfita.service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.net.Inet4Address;
import java.net.InetAddress;
import java.net.NetworkInterface;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.nio.file.StandardOpenOption;
import java.text.DecimalFormat;
import java.text.NumberFormat;
import java.text.SimpleDateFormat;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Date;
import java.util.Enumeration;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
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
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import org.springframework.web.multipart.MultipartFile;

import com.fasterxml.jackson.databind.ObjectMapper;

import esfita.common.AppConstants;
import esfita.common.ComboBoxDTO;
import esfita.common.ResponseDTO;
import esfita.dto.CategoryRecipeMappingDTO;
import esfita.dto.RecipeListingDTO;
import esfita.dto.RecipeMasterDTO;
import esfita.dto.RecipeMasterListDTO;
import esfita.dto.RecipeMealMappingDTO;
import esfita.entity.AppPreferences;
import esfita.entity.BasePortionQuantityMasterHib;
import esfita.entity.CategoryMasterHib;
import esfita.entity.CountryMasterHib;
import esfita.entity.ItemCategoryMasterHib;
import esfita.entity.ItemMasterHib;
import esfita.entity.MstCategoryMasterHib;
import esfita.entity.MstUserHib;
import esfita.entity.RecipeCategoryMappingHib;
import esfita.entity.RecipeDHib;
import esfita.entity.RecipeDHistoryHib;
import esfita.entity.RecipeHHib;
import esfita.entity.RecipeHHistoryHib;
import esfita.entity.RecipeMealMappingHib;
import esfita.entity.RecipeMealMasterHib;
import esfita.repository.AppPreferencesRepository;
import esfita.repository.BasePortionQuantityMasterRepository;
import esfita.repository.CategoryMasterRepository;
import esfita.repository.CountryMasterRepository;
import esfita.repository.ItemCategoryMasterRepository;
import esfita.repository.ItemMasterRepository;
import esfita.repository.MstCategoryMasterRepository;
import esfita.repository.MstUserRepository;
import esfita.repository.RecipeCategoryMappingRepository;
import esfita.repository.RecipeDHistoryRepository;
import esfita.repository.RecipeDRepository;
import esfita.repository.RecipeHHistoryRepository;
import esfita.repository.RecipeHRepository;
import esfita.repository.RecipeMealMappingRepository;
import esfita.repository.RecipeMealMasterRepository;
import esfita.utils.ConstantIFC;
import esfita.utils.RestException;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.log4j.Log4j2;

@Service
@Log4j2
public class RecipeService {

	@Autowired
	private RecipeHRepository recipeHRepository;
	@Autowired
	private RecipeDRepository recipeDRepository;
	@Autowired
	private RecipeCategoryMappingRepository recipeCategoryMappingRepository;
	@Autowired
	private RecipeMealMappingRepository recipeMealMappingRepository;
	@Autowired
	private RecipeMealMasterRepository recipeMealMasterRepository;

	@Autowired
	private MstUserRepository mstUserRepository;

	@Autowired
	private CountryMasterRepository countryMasterRepository;

	@Autowired
	private CategoryMasterRepository categoryMasterRepository;
	@Autowired
	ItemCategoryMasterRepository itemCategoryMasterRepository;
	@Autowired
	BasePortionQuantityMasterRepository basePortionQuantityMasterRepository;
	@Autowired
	RecipeHHistoryRepository recipeHHistoryRepository;
	@Autowired
	RecipeDHistoryRepository recipeDHistoryRepository;
	@Autowired
	ItemMasterRepository itemMasterRepository;
	@Autowired
	AppPreferencesRepository appPreferrenceRepository;
	@Autowired
	MstCategoryMasterRepository mstCategoryMasterRepository;

	private static final Logger log = LoggerFactory.getLogger(RecipeService.class);
	private static final String DATE_FORMAT = "yyyyMMddHHmmss";

	public ResponseDTO<List<RecipeMasterListDTO>> recipeMasterList(RecipeMasterListDTO input) {
		ResponseDTO<List<RecipeMasterListDTO>> response = new ResponseDTO<>();
		try {
			// Normalize input
			Integer cuisinesFk = (input.getCuisinesFk() != null && input.getCuisinesFk() != 0) ? input.getCuisinesFk()
					: null;
			String uom = (input.getUom() != null && !input.getUom().trim().isEmpty()) ? input.getUom() : null;
			Integer categoryFk = (input.getCategoryFk() != null && input.getCategoryFk() != 0) ? input.getCategoryFk()
					: null;

			// Single query fetching recipes with category and meal
			List<Object[]> recipeObjs = recipeHRepository.findRecipesWithCategoryAndMeal(cuisinesFk, uom, categoryFk);

			if (recipeObjs == null || recipeObjs.isEmpty()) {
				response.setSuccess(AppConstants.FALSE);
				response.setMessage(AppConstants.IS_EMPTY);
				return response;
			}

			// Map results to DTOs
			Map<Integer, RecipeMasterListDTO> recipeMap = new LinkedHashMap<>();
			for (Object[] obj : recipeObjs) {
				RecipeHHib recipe = (RecipeHHib) obj[0];
				CategoryMasterHib category = (CategoryMasterHib) obj[1]; // can be null
				RecipeMealMasterHib meal = (RecipeMealMasterHib) obj[2]; // can be null

				RecipeMasterListDTO dto = recipeMap.computeIfAbsent(recipe.getId(), rid -> {
					RecipeMasterListDTO d = new RecipeMasterListDTO();
					d.setId(recipe.getId());
					d.setRefNo(recipe.getRefNo());
					d.setRecipeName(recipe.getRecipeName());
					d.setUom(recipe.getUom());
					d.setTotalCost(recipe.getTotalCost());
					d.setServings(recipe.getFinishedProduct());
					d.setPerPortionCost(recipe.getPerPortionCost());
					d.setImageUrl(recipe.getImageUrl());
					d.setStatusStr(
							AppConstants.FLAG_A == recipe.getStatus() ? AppConstants.ACTIVE : AppConstants.IN_ACTIVE);
					d.setStatus(recipe.getStatus());
					d.setCategoryList(new ArrayList<>());
					d.setMealList(new ArrayList<>());
					return d;
				});

				// Map category
				if (category != null) {
					RecipeMasterListDTO cdto = new RecipeMasterListDTO();
					cdto.setCategoryName(category.getCategoryName());
					dto.getCategoryList().add(cdto);
				}

				// Map meal
				if (meal != null) {
					RecipeMasterListDTO mdto = new RecipeMasterListDTO();
					mdto.setMealName(meal.getRecipeMealName());
					dto.getMealList().add(mdto);
				}
			}

			List<RecipeMasterListDTO> recipeMasterList = new ArrayList<>(recipeMap.values());

			response.setData(recipeMasterList);
			response.setSuccess(AppConstants.TRUE);
			response.setMessage(AppConstants.MSG_RECORD_FETCHED);
			log.info("Recipe Details fetched Successfully, No of records: {}", recipeMasterList.size());

		} catch (Exception e) {
			response.setSuccess(AppConstants.FALSE);
			response.setMessage(AppConstants.EXCEPTION);
			log.error(AppConstants.EXCEPTION + " list", e);
		}

		return response;
	}

	public ResponseDTO<RecipeMasterListDTO> recipeStatusUpdate(RecipeMasterListDTO dto) {

		ResponseDTO<RecipeMasterListDTO> response = new ResponseDTO<>();

		try {
			if (null != dto && 0 != dto.getId()) {

				RecipeHHib hib = recipeHRepository.findByRecipeFk(dto.getId());
				if (null != hib) {
					char status = Character.toUpperCase(dto.getStatus());
					if (status == AppConstants.FLAG_A) {
						hib.setStatus(AppConstants.FLAG_A);
						response.setMessage(AppConstants.ACTIVATED);
					} else if (status == AppConstants.FLAG_I) {
						hib.setStatus(AppConstants.FLAG_I);
						response.setMessage(AppConstants.IN_ACTIVATED);
					}
					recipeHRepository.save(hib);
					response.setSuccess(true);
				} else {
					response.setSuccess(false);
					response.setMessage(AppConstants.IS_EMPTY);
				}
			} else {
				response.setSuccess(false);
				response.setMessage(AppConstants.E_DATA);
			}
		} catch (RestException exception) {
			log.warn(AppConstants.REST_EXCEPTION_UPDATE + " Recipe Master", exception);
			response.setSuccess(AppConstants.FALSE);
			response.setMessage(AppConstants.REST_EXCEPTION_UPDATE);
		} catch (Exception e) {
			log.error(AppConstants.EXCEPTION_UPDATE + " Recipe Master", e);
			response.setSuccess(AppConstants.FALSE);
			response.setMessage(AppConstants.EXCEPTION_UPDATE);
		}
		return response;

	}

	public ResponseDTO<RecipeMasterDTO> recipeViewById(int id) {
		ResponseDTO<RecipeMasterDTO> response = new ResponseDTO<>();
		try {
			RecipeHHib recipe = recipeHRepository.findByRecipeFk(id);
			if (recipe == null) {
				return handleNotFound(response, id);
			}
			RecipeMasterDTO dto = buildRecipeMasterDTO(recipe);
			response.setData(dto);
			response.setSuccess(AppConstants.TRUE);
			response.setMessage(AppConstants.MSG_RECORD_FETCHED);
			log.info(AppConstants.RECIPE_DETAILS_FETCHED, id);
		} catch (RestException re) {
			log.warn(AppConstants.REST_EXCEPTION + " record not found with ID: {}", id, re);
			response.setSuccess(AppConstants.FALSE);
			response.setMessage(AppConstants.REST_EXCEPTION);
		} catch (Exception e) {
			log.error(AppConstants.EXCEPTION + " Recipefetch byID", e);
			response.setSuccess(AppConstants.FALSE);
			response.setMessage(AppConstants.EXCEPTION);
		}
		log.info("RecipeView process completed for ID: {}", id);
		return response;
	}

	private ResponseDTO<RecipeMasterDTO> handleNotFound(ResponseDTO<RecipeMasterDTO> response, int id) {
		response.setSuccess(AppConstants.FALSE);
		response.setMessage(AppConstants.EMPTY + id);
		log.warn(AppConstants.RECIPE_DETAILS_FETCHED, id);
		return response;
	}

	private RecipeMasterDTO buildRecipeMasterDTO(RecipeHHib recipe) {
		RecipeMasterDTO dto = new RecipeMasterDTO();
		setBasicRecipeDetails(dto, recipe);
		setCuisineName(dto, recipe);
		setCategoryList(dto, recipe);
		setMealList(dto, recipe);
		setUserDetails(dto, recipe);
		setRecipeItems(dto, recipe);
		return dto;
	}

	private void setBasicRecipeDetails(RecipeMasterDTO dto, RecipeHHib recipe) {
		dto.setId(recipe.getId());
		dto.setRecipeName(recipe.getRecipeName());
		dto.setRefNo(recipe.getRefNo());
		dto.setStatusStr(recipe.getStatus() == AppConstants.FLAG_A ? AppConstants.ACTIVE : AppConstants.IN_ACTIVE);
		dto.setPortionSize(recipe.getPortionSize());
		dto.setUom(recipe.getUom());
		dto.setBaseQuantity(recipe.getBaseQuantity());
		dto.setFinishedProduct(recipe.getFinishedProduct());
		dto.setTotalCost(recipe.getTotalCost());
		dto.setPerPortionCost(recipe.getPerPortionCost());
		dto.setProtein(recipe.getProtein());
		dto.setCalories(recipe.getCalories());
		dto.setCarbs(recipe.getCarbs());
		dto.setFat(recipe.getFat());
		dto.setCreatedDate(recipe.getCreatedDate());
		dto.setUpdatedDate(recipe.getUpdatedDate());
		dto.setCookingInstruction(recipe.getCookingInstruction().replace("\\n", "\n"));
		dto.setImageUrl(recipe.getImageUrl());
	}

	private void setCuisineName(RecipeMasterDTO dto, RecipeHHib recipe) {
		CountryMasterHib country = countryMasterRepository.findOne(recipe.getCountryOriginFk());
		dto.setCuisineName(country != null ? country.getCountryName() : "");
	}

	private void setCategoryList(RecipeMasterDTO dto, RecipeHHib recipe) {
		List<RecipeMasterDTO> categoryList = new ArrayList<>();
		List<RecipeCategoryMappingHib> categories = recipeCategoryMappingRepository.findByIdAndAct(recipe.getId());
		for (RecipeCategoryMappingHib category : categories) {
			RecipeMasterDTO categoryDto = new RecipeMasterDTO();
			CategoryMasterHib categoryMaster = categoryMasterRepository.findById(category.getCategoryFk());
			categoryDto.setCategoryName(categoryMaster != null ? categoryMaster.getCategoryName() : "");
			categoryList.add(categoryDto);
		}
		dto.setCategoryListName(categoryList);
	}

	private void setMealList(RecipeMasterDTO dto, RecipeHHib recipe) {
		List<RecipeMasterDTO> mealList = new ArrayList<>();
		List<RecipeMealMappingHib> meals = recipeMealMappingRepository.findByIdAndAct(recipe.getId());
		for (RecipeMealMappingHib meal : meals) {
			RecipeMasterDTO mealDto = new RecipeMasterDTO();
			RecipeMealMasterHib mealMaster = recipeMealMasterRepository.findByRecipeMealId(meal.getMealFk());
			mealDto.setMealName(mealMaster != null ? mealMaster.getRecipeMealName() : "");
			mealList.add(mealDto);
		}
		dto.setMealList(mealList);
	}

	private void setUserDetails(RecipeMasterDTO dto, RecipeHHib recipe) {
		MstUserHib user = mstUserRepository.findByUserId(recipe.getCreatedBy());
		if (user != null) {
			dto.setUserName(user.getFirstName());
		}
	}

	private void setRecipeItems(RecipeMasterDTO dto, RecipeHHib recipe) {
		List<RecipeMasterDTO> itemList = new ArrayList<>();
		List<RecipeDHib> recipeDetails = recipeDRepository.findByActRecipe(recipe.getId());
		if (recipeDetails != null) {
			for (RecipeDHib detail : recipeDetails) {
				RecipeMasterDTO itemDto = new RecipeMasterDTO();
				setItemDetails(itemDto, detail);
				itemList.add(itemDto);
			}
			dto.setRecipeSubList(itemList);
			dto.setItemCount(itemList.size());
		}
	}

	private void setItemDetails(RecipeMasterDTO itemDto, RecipeDHib detail) {
		ItemCategoryMasterHib itemCategory = itemCategoryMasterRepository.findById(detail.getCategoryFk());
		itemDto.setItemCategoryName(itemCategory != null ? itemCategory.getItemCategoryName() : "");
		itemDto.setItemFk(detail.getId());
		itemDto.setItemCode(detail.getItemCode());
		itemDto.setItemName(detail.getItemName());
		itemDto.setPackageId(detail.getPackageId());
		itemDto.setPackagePrice(detail.getPackagePrice());
		itemDto.setChefUnit(detail.getPackageSecondaryUnit());
		itemDto.setCostPrice(detail.getPackageSecondaryCost());
		itemDto.setQuantity(detail.getSecondaryQuantity());
		itemDto.setTotal(detail.getTotal());
		itemDto.setPackagePerQty(detail.getSecondaryQuantity() / 5);
		itemDto.setPackagePerCost(detail.getPackageSecondaryCost() / 5);
	}

	public ResponseDTO<RecipeMasterListDTO> recipeVersionList(int recPk) {
		ResponseDTO<RecipeMasterListDTO> response = new ResponseDTO<>();
		List<RecipeMasterListDTO> versionList = new ArrayList<>();

		try {
			RecipeHHib ver = recipeHRepository.findByRecipeFk(recPk);
			RecipeMasterListDTO dto = new RecipeMasterListDTO();

			dto.setId(ver.getId());
			dto.setRecipeFk(ver.getId());
			dto.setRefNo(ver.getRefNo());
			dto.setRecipeName(ver.getRecipeName());
			dto.setVersion("Version " + ver.getVersionNo());
			dto.setVersionNo(ver.getVersionNo());
			if (AppConstants.FLAG_A == ver.getStatus()) {
				dto.setStatusStr(AppConstants.ACTIVE);
			} else {
				dto.setStatusStr(AppConstants.IN_ACTIVE);
			}
			MstUserHib user = mstUserRepository.findByUserId(ver.getCreatedBy());
			if (user != null) {
				dto.setUserName(user.getFirstName());

			}
			dto.setUpdatedDate(ver.getUpdatedDate());
			dto.setCreatedDate(ver.getCreatedDate());
			dto.setUpdatedDate(ver.getUpdatedDate());

			List<RecipeHHistoryHib> verList = recipeHHistoryRepository.findVersionList(recPk);

			if (null != verList && !verList.isEmpty()) {
				for (RecipeHHistoryHib hib : verList) {

					RecipeMasterListDTO ddto = new RecipeMasterListDTO();
					ddto.setVersionNo(hib.getVersionNo());
					ddto.setVersion("Version " + hib.getVersionNo());
					MstUserHib mstUserHib = mstUserRepository.findByUserId(hib.getUpdateBy());
					if (null != mstUserHib) {
						ddto.setUserName(mstUserHib.getFirstName());
					}
					ddto.setUpdatedDate(hib.getUpdatedDate());

					versionList.add(ddto);

				}
				dto.setVersionList(versionList);

				response.setData(dto);

				response.setSuccess(AppConstants.TRUE);
				response.setMessage(AppConstants.MSG_RECORD_FETCHED);
				log.info(AppConstants.RECIPE_DETAILS_FETCHED, versionList.size());

			} else {
				response.setSuccess(AppConstants.FALSE);
				response.setMessage(AppConstants.IS_EMPTY);
			}

		} catch (RestException re) {
			response.setSuccess(AppConstants.FALSE);
			log.warn(AppConstants.REST_EXCEPTION + " Version list", re);
		} catch (Exception e) {
			response.setSuccess(AppConstants.FALSE);
			log.error(AppConstants.EXCEPTION + " Version  list", e);
		}
		return response;
	}

	public ResponseDTO<RecipeMasterDTO> versionView(int recipeFk, int versionNo) {
		ResponseDTO<RecipeMasterDTO> response = new ResponseDTO<>();
		try {
			RecipeHHistoryHib hib = recipeHHistoryRepository.findVersion(recipeFk, versionNo);
			if (hib == null) {
				setErrorResponse(response, AppConstants.EMPTY + "records not found ID: " + recipeFk);
				log.info("{} {} --->", AppConstants.RECIPE_DETAILS_FETCHED, recipeFk);
				return response;
			}

			RecipeMasterDTO dto = buildRecipeMasterVersionDTO(hib);
			response.setData(dto);
			response.setSuccess(AppConstants.TRUE);
			response.setMessage(AppConstants.MSG_RECORD_FETCHED);
			log.info("{} {}", AppConstants.MSG_RECORD_FETCHED, dto.getId());

		} catch (RestException re) {
			log.warn(AppConstants.REST_EXCEPTION + " Recipe record not found with ID: {}", recipeFk, re);
			setErrorResponse(response, AppConstants.REST_EXCEPTION);
		} catch (Exception e) {
			log.error(AppConstants.EXCEPTION + " Recipe record fetch by ID", e);
			setErrorResponse(response, AppConstants.EXCEPTION);
		}
		log.info("Recipe fetching  process completed for ID: {}", recipeFk);
		return response;
	}

	private void setErrorResponse(ResponseDTO<RecipeMasterDTO> response, String message) {
		response.setSuccess(AppConstants.FALSE);
		response.setMessage(message);
	}

	private RecipeMasterDTO buildRecipeMasterVersionDTO(RecipeHHistoryHib hib) {
		RecipeMasterDTO dto = new RecipeMasterDTO();
		dto.setId(hib.getId());
		dto.setRecipeName(hib.getRecipeName());
		dto.setRefNo(hib.getRefNo());
		dto.setVersionNo(hib.getVersionNo());
		dto.setCuisineName(fetchCuisineName(hib.getCountryOriginFk()));
		dto.setCategoryListName(fetchCategoryList(hib.getRecipeFk()));
		dto.setMealList(fetchMealList(hib.getRecipeFk()));
		dto.setPortionSize(hib.getPortionSize());
		dto.setUom(hib.getUom());
		dto.setBaseQuantity(hib.getBaseQuantity());
		dto.setFinishedProduct(hib.getFinishedProduct());
		dto.setTotalCost(hib.getTotalCost());
		dto.setPerPortionCost(hib.getPerPortionCost());
		dto.setProtein(hib.getProtein());
		dto.setCalories(hib.getCalories());
		dto.setCarbs(hib.getCarbs());
		dto.setFat(hib.getFat());
		dto.setUserName(fetchUserName(hib.getUpdateBy()));
		dto.setUpdatedDate(hib.getUpdatedDate());
		dto.setCookingInstruction(hib.getCookingInstruction().replace("\\n", "\n"));
		dto.setImageUrl(hib.getImageUrl());
		dto.setCreatedDate(hib.getCreatedDate());
		List<RecipeMasterDTO> itemList = fetchItemList(hib.getId());
		dto.setRecipeSubList(itemList);
		dto.setItemCount(itemList.size());
		if (hib.getStatus() == 'A') {
			dto.setStatusStr("Active");
		} else {
			dto.setStatusStr("InActive");
		}
		return dto;
	}

	private String fetchCuisineName(int countryOriginFk) {
		CountryMasterHib catHib = countryMasterRepository.findOne(countryOriginFk);
		return catHib != null ? catHib.getCountryName() : "";
	}

	private List<RecipeMasterDTO> fetchCategoryList(int recipeId) {
		List<RecipeMasterDTO> categoryList = new ArrayList<>();
		List<RecipeCategoryMappingHib> cateHib = recipeCategoryMappingRepository.findByIdAndAct(recipeId);
		for (RecipeCategoryMappingHib chib : cateHib) {
			RecipeMasterDTO cDto = new RecipeMasterDTO();
			CategoryMasterHib caHib = categoryMasterRepository.findById(chib.getCategoryFk());
			cDto.setCategoryName(caHib != null ? caHib.getCategoryName() : "");
			categoryList.add(cDto);
		}
		return categoryList;
	}

	private List<RecipeMasterDTO> fetchMealList(int recipeId) {
		List<RecipeMasterDTO> mealList = new ArrayList<>();
		List<RecipeMealMappingHib> mealHib = recipeMealMappingRepository.findByIdAndAct(recipeId);
		for (RecipeMealMappingHib mhib : mealHib) {
			RecipeMasterDTO mDto = new RecipeMasterDTO();
			RecipeMealMasterHib meHib = recipeMealMasterRepository.findByRecipeMealId(mhib.getMealFk());
			mDto.setMealName(meHib != null ? meHib.getRecipeMealName() : "");
			mealList.add(mDto);
		}
		return mealList;
	}

	private List<RecipeMasterDTO> fetchItemList(int recipeId) {
		List<RecipeMasterDTO> itemList = new ArrayList<>();
		List<RecipeDHistoryHib> dHib = recipeDHistoryRepository.findByRecipe(recipeId);
		if (dHib != null) {
			for (RecipeDHistoryHib dhib : dHib) {
				RecipeMasterDTO ddto = new RecipeMasterDTO();
				ItemCategoryMasterHib iCa = itemCategoryMasterRepository.findById(dhib.getCategoryFk());
				ddto.setItemCategoryName(iCa != null ? iCa.getItemCategoryName() : "");
				ddto.setItemFk(dhib.getId());
				ddto.setItemCode(dhib.getItemCode());
				ddto.setItemName(dhib.getItemName());
				ddto.setPackageId(dhib.getPackageId());
				ddto.setPackagePrice(dhib.getPackagePrice());
				ddto.setChefUnit(dhib.getPackageSecondaryUnit());
				ddto.setCostPrice(dhib.getPackageSecondaryCost());
				ddto.setQuantity(dhib.getSecondaryQuantity());
				ddto.setTotal(dhib.getTotal());
				itemList.add(ddto);
			}
		}
		return itemList;
	}

	private String fetchUserName(int userId) {
		MstUserHib user = mstUserRepository.findByUserId(userId);
		return user != null ? user.getFirstName() : "";
	}

	// ==========================================================================================================================

	public ResponseDTO<RecipeMasterDTO> versionCompare(int recipeFk, int versionNo) {
		ResponseDTO<RecipeMasterDTO> response = new ResponseDTO<>();
		RecipeMasterDTO versionDTO = new RecipeMasterDTO();

		try {
			// Fetch historical version
			RecipeHHistoryHib hib = recipeHHistoryRepository.findVersion(recipeFk, versionNo);
			RecipeMasterDTO oldVersion = hib != null ? compareBuildHistoricalDTO(hib) : new RecipeMasterDTO();

			// Fetch current version
			RecipeHHib hibNew = recipeHRepository.findByRecipeFk(recipeFk);
			if (hibNew == null) {
				compareSetErrorResponse(response, AppConstants.EMPTY + "Recipe not found for ID: " + recipeFk);
				log.warn(AppConstants.IS_EMPTY, recipeFk);
				return response;
			}
			RecipeMasterDTO currentVersion = compareBuildCurrentDTO(hibNew);

			// Set versions in response DTO
			versionDTO.setOldVersion(oldVersion);
			versionDTO.setCurrentVersion(currentVersion);
			response.setData(versionDTO);
			response.setSuccess(AppConstants.TRUE);
			response.setMessage(AppConstants.MSG_RECORD_FETCHED);

		} catch (RestException re) {
			log.warn(AppConstants.REST_EXCEPTION + " RecordsFecth not found with ID: {}", recipeFk, re);
			compareSetErrorResponse(response, AppConstants.REST_EXCEPTION);
		} catch (Exception e) {
			log.error(AppConstants.EXCEPTION + " Recipe get by ID", e);
			compareSetErrorResponse(response, AppConstants.EXCEPTION);
		}

		log.info("Recipe view process success for ID: {}", recipeFk);
		return response;
	}

	private void compareSetErrorResponse(ResponseDTO<RecipeMasterDTO> response, String message) {
		response.setMessage(message);
		response.setSuccess(AppConstants.FALSE);
	}

	private RecipeMasterDTO compareBuildHistoricalDTO(RecipeHHistoryHib hib) {
		RecipeMasterDTO dto = new RecipeMasterDTO();
		// Grouped field assignments for clarity
		setBasicFields(dto, hib.getId(), hib.getRecipeName(), hib.getRefNo(), hib.getVersionNo());
		setNutritionalFields(dto, hib.getProtein(), hib.getCalories(), hib.getCarbs(), hib.getFat());
		setMeasurementFields(dto, hib.getPortionSize(), hib.getUom(), hib.getBaseQuantity());
		dto.setFinishedProduct(hib.getFinishedProduct());
		dto.setTotalCost(hib.getTotalCost());
		dto.setPerPortionCost(hib.getPerPortionCost());
		dto.setCuisineName(compareFetchCuisineName(hib.getCountryOriginFk()));
		dto.setCategoryListName(compareFetchCategoryList(hib.getId()));
		dto.setMealList(compareFetchMealList(hib.getId()));
		dto.setUserName(compareFetchUserName(hib.getUpdateBy()));
		dto.setUpdatedDate(hib.getUpdatedDate());
		dto.setCookingInstruction(
				hib.getCookingInstruction() != null ? hib.getCookingInstruction().replace("\\n", "\n") : "");
		dto.setImageUrl(hib.getImageUrl());
		dto.setCreatedDate(hib.getCreatedDate());
		List<RecipeMasterDTO> itemList = compareFetchHistoricalItems(hib.getId());
		dto.setRecipeSubList(itemList);
		dto.setItemCount(itemList.size());
		return dto;
	}

	private RecipeMasterDTO compareBuildCurrentDTO(RecipeHHib hib) {
		RecipeMasterDTO dto = new RecipeMasterDTO();
		// Grouped field assignments for clarity
		setBasicFields(dto, hib.getId(), hib.getRecipeName(), hib.getRefNo(), null);
		setNutritionalFields(dto, hib.getProtein(), hib.getCalories(), hib.getCarbs(), hib.getFat());
		setMeasurementFields(dto, hib.getPortionSize(), hib.getUom(), hib.getBaseQuantity());
		dto.setFinishedProduct(hib.getFinishedProduct());
		dto.setTotalCost(hib.getTotalCost());
		dto.setPerPortionCost(hib.getPerPortionCost());
		dto.setCuisineName(compareFetchCuisineName(hib.getCountryOriginFk()));
		dto.setCategoryListName(compareFetchCategoryList(hib.getId()));
		dto.setStatusStr(AppConstants.FLAG_A == hib.getStatus() ? AppConstants.ACTIVE : AppConstants.IN_ACTIVE);
		dto.setMealList(compareFetchMealList(hib.getId()));
		dto.setUserName(compareFetchUserName(hib.getUpdatedBy()));
		dto.setCreatedDate(hib.getCreatedDate());
		dto.setUpdatedDate(hib.getUpdatedDate());
		dto.setCookingInstruction(
				hib.getCookingInstruction() != null ? hib.getCookingInstruction().replace("\\n", "\n") : "");
		List<RecipeMasterDTO> itemList = compareFetchCurrentItems(hib.getId());
		dto.setRecipeSubList(itemList);
		dto.setItemCount(itemList.size());
		return dto;
	}

	private void setBasicFields(RecipeMasterDTO dto, int id, String recipeName, String refNo, Integer versionNo) {
		dto.setId(id);
		dto.setRecipeName(recipeName);
		dto.setRefNo(refNo);
		if (versionNo != null) {
			dto.setVersionNo(versionNo);
		}
	}

	private void setNutritionalFields(RecipeMasterDTO dto, Double protein, Double calories, Double carbs, Double fat) {
		dto.setProtein(protein);
		dto.setCalories(calories);
		dto.setCarbs(carbs);
		dto.setFat(fat);
	}

	private void setMeasurementFields(RecipeMasterDTO dto, Double portionSize, String uom, Double baseQuantity) {
		dto.setPortionSize(portionSize);
		dto.setUom(uom);
		dto.setBaseQuantity(baseQuantity);
	}

	private String compareFetchCuisineName(int countryOriginFk) {
		// Different implementation: Use a try-catch for null handling
		try {
			CountryMasterHib catHib = countryMasterRepository.findOne(countryOriginFk);
			if (catHib == null) {
				return "";
			}
			return catHib.getCountryName();
		} catch (Exception e) {
			return "";
		}
	}

	private List<RecipeMasterDTO> compareFetchCategoryList(int recipeId) {
		// Different implementation: Use streams instead of for-loop
		List<RecipeCategoryMappingHib> cateHib = recipeCategoryMappingRepository.findByIdAndAct(recipeId);
		return cateHib.stream().map(chib -> {
			RecipeMasterDTO cDto = new RecipeMasterDTO();
			CategoryMasterHib caHib = categoryMasterRepository.findById(chib.getCategoryFk());
			cDto.setCategoryName(caHib != null ? caHib.getCategoryName() : "");
			return cDto;
		}).toList();
	}

	private List<RecipeMasterDTO> compareFetchMealList(int recipeId) {
		// Different implementation: Use streams instead of for-loop
		List<RecipeMealMappingHib> mealHib = recipeMealMappingRepository.findByIdAndAct(recipeId);
		return mealHib.stream().map(mhib -> {
			RecipeMasterDTO mDto = new RecipeMasterDTO();
			RecipeMealMasterHib meHib = recipeMealMasterRepository.findByRecipeMealId(mhib.getMealFk());
			mDto.setMealName(meHib != null ? meHib.getRecipeMealName() : "");
			return mDto;
		}).toList();
	}

	private List<RecipeMasterDTO> compareFetchHistoricalItems(int recipeId) {
		List<RecipeDHistoryHib> dHib = recipeDHistoryRepository.findByRecipe(recipeId);
		if (dHib == null) {
			return new ArrayList<>();
		}
		// Different implementation: Use helper method for item DTO creation
		return dHib.stream().map(this::createHistoricalItemDTO).toList();
	}

	private RecipeMasterDTO createHistoricalItemDTO(RecipeDHistoryHib dhib) {
		RecipeMasterDTO ddto = new RecipeMasterDTO();
		ItemCategoryMasterHib iCa = itemCategoryMasterRepository.findById(dhib.getCategoryFk());
		ddto.setItemCategoryName(iCa != null ? iCa.getItemCategoryName() : "");
		ddto.setItemFk(dhib.getId());
		ddto.setItemCode(dhib.getItemCode());
		ddto.setItemName(dhib.getItemName());
		ddto.setPackageId(dhib.getPackageId());
		ddto.setPackagePrice(dhib.getPackagePrice());
		ddto.setChefUnit(dhib.getPackageSecondaryUnit());
		ddto.setCostPrice(dhib.getPackageSecondaryCost());
		ddto.setQuantity(dhib.getSecondaryQuantity());
		ddto.setTotal(dhib.getTotal());
		return ddto;
	}

	private List<RecipeMasterDTO> compareFetchCurrentItems(int recipeId) {
		List<RecipeDHib> dHib = recipeDRepository.findByActRecipe(recipeId);
		if (dHib == null) {
			return new ArrayList<>();
		}
		// Different implementation: Use helper method for item DTO creation
		return dHib.stream().map(this::createCurrentItemDTO).toList();
	}

	private RecipeMasterDTO createCurrentItemDTO(RecipeDHib dhib) {
		RecipeMasterDTO ddto = new RecipeMasterDTO();
		ItemCategoryMasterHib iCa = itemCategoryMasterRepository.findById(dhib.getCategoryFk());
		ddto.setItemCategoryName(iCa != null ? iCa.getItemCategoryName() : "");
		ddto.setItemFk(dhib.getId());
		ddto.setItemCode(dhib.getItemCode());
		ddto.setItemName(dhib.getItemName());
		ddto.setPackageId(dhib.getPackageId());
		ddto.setPackagePrice(dhib.getPackagePrice());
		ddto.setChefUnit(dhib.getPackageSecondaryUnit());
		ddto.setCostPrice(dhib.getPackageSecondaryCost());
		ddto.setQuantity(dhib.getSecondaryQuantity());
		ddto.setTotal(dhib.getTotal());
		return ddto;
	}

	private String compareFetchUserName(int userId) {
		// Different implementation: Use a default user name instead of empty string
		MstUserHib user = mstUserRepository.findByUserId(userId);
		return user != null ? user.getFirstName() : "Unknown";
	}

// Modify View 
	public ResponseDTO<RecipeMasterDTO> recipeMasterViewById(Integer id) {
		ResponseDTO<RecipeMasterDTO> response = new ResponseDTO<>();

		try {

			RecipeHHib recipe = recipeHRepository.findByRecipeFk(id);
			if (null == recipe) {
				response.setSuccess(AppConstants.FALSE);
				response.setMessage("Recipe not found with ID: " + id);
				return response;
			}

			RecipeMasterDTO dto = new RecipeMasterDTO();

			dto.setId(recipe.getId());

			dto.setRecipeName(recipe.getRecipeName());
			dto.setRefNo(recipe.getRefNo());
			dto.setUniqueNo(recipe.getUniqueNo());
			dto.setCookingInstruction(recipe.getCookingInstruction());
			dto.setCountryOriginFk(recipe.getCountryOriginFk());
			dto.setBaseQuantityFk(recipe.getBaseQuantityFk());
			dto.setBaseQuantity(recipe.getBaseQuantity());
			dto.setUom(recipe.getUom());
			dto.setFinishedProduct(recipe.getFinishedProduct());
			dto.setPortionSize(recipe.getPortionSize());
			dto.setImageUrl(recipe.getImageUrl());
			dto.setTotalCost(recipe.getTotalCost());
			dto.setPerPortionCost(recipe.getPerPortionCost());

			dto.setVersionNo(recipe.getVersionNo());
			dto.setCreatedBy(recipe.getCreatedBy());
			dto.setCreatedDate(recipe.getCreatedDate());
			dto.setUpdatedBy(recipe.getUpdatedBy());
			dto.setUpdatedDate(recipe.getUpdatedDate());
			dto.setCalories(recipe.getCalories());
			dto.setProtein(recipe.getProtein());
			dto.setCarbs(recipe.getCarbs());
			dto.setFat(recipe.getFat());

			List<RecipeCategoryMappingHib> categoryMappings = recipeCategoryMappingRepository
					.findByIdAndAct(recipe.getId());

			List<String> categoryList = categoryMappings.stream()
					.map(mapping -> String.valueOf(mapping.getCategoryFk())).toList();

			dto.setCategoryList(categoryList);

			List<RecipeMealMappingHib> mealMappings = recipeMealMappingRepository.findByIdAndAct(recipe.getId());

			List<String> mealList = mealMappings.stream().map(mapping -> String.valueOf(mapping.getMealFk())).toList();
			dto.setMealtype(mealList);

			List<RecipeDHib> details = recipeDRepository.findByActRecipe(recipe.getId());
			List<RecipeMasterDTO> subList = new ArrayList<>();

			for (RecipeDHib d : details) {
				RecipeMasterDTO subDto = new RecipeMasterDTO();
				subDto.setItemCategoryFk(d.getCategoryFk());
				subDto.setItemFk(d.getItemFk());
				subDto.setItemCategoryName(d.getCategoryName());
				subDto.setItemCode(d.getItemCode());
				subDto.setItemName(d.getItemName());
				subDto.setPackageId(d.getPackageId());
				subDto.setPackagePrice(d.getPackagePrice());
				subDto.setPackageSecondaryUnit(d.getPackageSecondaryUnit());
				subDto.setPackageSecondaryCost(d.getPackageSecondaryCost());

				subDto.setSecondaryQuantity(d.getSecondaryQuantity());
				subDto.setTotal(d.getTotal());
				subList.add(subDto);
			}
			dto.setRecipeSubList(subList);

			// Category Mapping

			response.setSuccess(AppConstants.TRUE);
			response.setData(dto);

		} catch (RestException re) {
			log.warn(AppConstants.REST_EXCEPTION + " Recipe not found with ID: {}", id, re);
			response.setSuccess(AppConstants.FALSE);
			response.setMessage(AppConstants.REST_EXCEPTION);
		} catch (Exception e) {
			response.setSuccess(AppConstants.FALSE);
			response.setMessage(AppConstants.EXCEPTION);
			log.error(AppConstants.EXCEPTION + " Recipe fetch by ID", e);
		}
		log.info("Recipe view process completed for ID: {}", id);
		return response;
	}

//	Recipe Master save =====================================================================================================
	public ResponseDTO<List<ComboBoxDTO>> loadCountryDropDowm() {
		ResponseDTO<List<ComboBoxDTO>> response = new ResponseDTO<>();
		List<ComboBoxDTO> comboList = new ArrayList<>();
		try {
			List<CountryMasterHib> countryHib = countryMasterRepository.orderBy();
			if (countryHib != null) {
				for (CountryMasterHib hib : countryHib) {
					ComboBoxDTO dto = new ComboBoxDTO();
					dto.setPk(hib.getId());
					dto.setName(hib.getCountryName());
					dto.setCode(hib.getCountryCode());
					comboList.add(dto);
				}
			}
			response.setSuccess(AppConstants.FALSE);
			response.setMessage(AppConstants.E_DATA);

			response.setData(comboList);
		} catch (RestException re) {
			response.setSuccess(AppConstants.FALSE);
			log.warn(AppConstants.REST_EXCEPTION + " Country Name", re);
		} catch (Exception e) {
			response.setSuccess(AppConstants.FALSE);
			log.error(AppConstants.EXCEPTION + " Country Name", e);
		}
		return response;
	}

	public ResponseDTO<List<ComboBoxDTO>> loadMealTypeDropDown() {
		ResponseDTO<List<ComboBoxDTO>> response = new ResponseDTO<>();
		List<ComboBoxDTO> comboList = new ArrayList<>();
		try {
			List<RecipeMealMasterHib> meal = recipeMealMasterRepository.orderBy();
			if (meal != null) {
				for (RecipeMealMasterHib hib : meal) {
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

	public ResponseDTO<List<ComboBoxDTO>> loadBaseQuantityDropDown() {
		ResponseDTO<List<ComboBoxDTO>> response = new ResponseDTO<>();
		List<ComboBoxDTO> comboList = new ArrayList<>();
		try {
			List<BasePortionQuantityMasterHib> hib1 = basePortionQuantityMasterRepository.orderBy();
			if (hib1 != null) {
				for (BasePortionQuantityMasterHib hib : hib1) {
					ComboBoxDTO dto = new ComboBoxDTO();
					dto.setPk(hib.getId());
					dto.setQuantity(hib.getQuantity());

					comboList.add(dto);
				}
			} else {
				response.setSuccess(AppConstants.FALSE);
				response.setMessage(AppConstants.E_DATA);
			}

			response.setData(comboList);
		} catch (RestException re) {
			response.setSuccess(AppConstants.FALSE);
			log.warn(AppConstants.REST_EXCEPTION, re);
		} catch (Exception e) {
			response.setSuccess(AppConstants.FALSE);
			log.error(AppConstants.EXCEPTION + "Quantity", e);
		}
		return response;
	}

	public ResponseDTO<List<ComboBoxDTO>> loadItemCategoryDropDown() {
		ResponseDTO<List<ComboBoxDTO>> response = new ResponseDTO<>();
		List<ComboBoxDTO> comboList = new ArrayList<>();
		try {
			List<ItemCategoryMasterHib> itemCategoryMasterHib = itemCategoryMasterRepository.orderBy();
			if (itemCategoryMasterHib != null) {
				for (ItemCategoryMasterHib hib : itemCategoryMasterHib) {
					ComboBoxDTO dto = new ComboBoxDTO();
					dto.setPk(hib.getId());
					dto.setName(hib.getItemCategoryName());
					dto.setCode(hib.getItemCategoryName());
					comboList.add(dto);
				}
			} else {
				response.setSuccess(AppConstants.FALSE);
				response.setMessage(AppConstants.E_DATA);
			}
			response.setSuccess(AppConstants.TRUE);
			response.setMessage(AppConstants.MSG_RECORD_FETCHED);
			response.setData(comboList);
		} catch (RestException re) {
			response.setSuccess(AppConstants.FALSE);
			log.warn(AppConstants.REST_EXCEPTION + "ItemCategoryLists", re);
		} catch (Exception e) {
			response.setSuccess(AppConstants.FALSE);
			log.error(AppConstants.EXCEPTION + "list", e);
		}
		return response;
	}

	public ResponseDTO<List<ComboBoxDTO>> loadCategoryDropDown() {
		ResponseDTO<List<ComboBoxDTO>> response = new ResponseDTO<>();
		List<ComboBoxDTO> comboList = new ArrayList<>();
		try {
			List<CategoryMasterHib> mstCategoryMasterHib = categoryMasterRepository.orderBy();
			if (mstCategoryMasterHib != null) {
				for (CategoryMasterHib hib : mstCategoryMasterHib) {
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
			response.setMessage(AppConstants.MSG_RECORD_FETCHED);
			response.setData(comboList);
		} catch (RestException re) {
			response.setSuccess(AppConstants.FALSE);
			log.warn(AppConstants.REST_EXCEPTION + "Item CategoryList", re);
		} catch (Exception e) {
			response.setSuccess(AppConstants.FALSE);
			log.error(AppConstants.EXCEPTION + "ItemCategory List", e);
		}
		return response;
	}

	public ResponseDTO<List<ComboBoxDTO>> loadItemMasterDropDown(int id) {
		ResponseDTO<List<ComboBoxDTO>> response = new ResponseDTO<>();
		List<ComboBoxDTO> comboList = new ArrayList<>();
		try {
			List<ItemMasterHib> itemHib = itemMasterRepository.findByCategoryFk(id);
			if (itemHib != null) {
				for (ItemMasterHib hib : itemHib) {
					ComboBoxDTO dto = new ComboBoxDTO();
					dto.setPk(hib.getId());
					dto.setName(hib.getItemName());
					dto.setPackageId(hib.getPackageId());
					dto.setPackagePrice(hib.getPackagePrice());
					dto.setChefUnit(hib.getPackageBaseUnit());
					dto.setChefCost(hib.getPackageSecondaryCost());

					dto.setCode(hib.getItemCode());
					comboList.add(dto);
				}
			} else {
				response.setSuccess(AppConstants.FALSE);
				response.setMessage(AppConstants.E_DATA);
			}

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

	public ResponseDTO<List<RecipeMasterDTO>> itemList() {
		ResponseDTO<List<RecipeMasterDTO>> response = new ResponseDTO<>();
		List<RecipeMasterDTO> itemDTOList = new ArrayList<>();

		try {
			// Fetch all items
			List<ItemMasterHib> itemMasterList = itemMasterRepository.orderBy();

			if (!itemMasterList.isEmpty()) {
				// Pre-fetch all categories into a Map to avoid N+1 query problem
				Map<Integer, String> categoryMap = itemCategoryMasterRepository.findAll().stream().collect(
						Collectors.toMap(ItemCategoryMasterHib::getId, ItemCategoryMasterHib::getItemCategoryName));

				// Map items to DTOs
				for (ItemMasterHib hib : itemMasterList) {
					RecipeMasterDTO dto = new RecipeMasterDTO();
					dto.setItemFk(hib.getId());
					dto.setItemName(hib.getItemName());
					dto.setItemCode(hib.getItemCode());
					dto.setPackageId(hib.getPackageId());
					dto.setPackageSecondaryCost(hib.getPackageSecondaryCost());
					dto.setPackagePrice(hib.getPackagePrice());
					dto.setPackageSecondaryUnit(hib.getPackageSecondaryUnit());
					dto.setItemCategoryFk(hib.getCategoryFk());
					dto.setItemCategoryName(categoryMap.get(hib.getCategoryFk())); // use pre-fetched map
					itemDTOList.add(dto);
				}

				response.setData(itemDTOList);
				response.setSuccess(AppConstants.TRUE);
				response.setMessage(AppConstants.MSG_RECORD_FETCHED);

				log.info("{} {} --->", AppConstants.RECIPE_DETAILS_FETCHED, itemDTOList.size());
			} else {
				response.setSuccess(AppConstants.FALSE);
				response.setMessage(AppConstants.IS_EMPTY);
			}

		} catch (RestException re) {
			response.setSuccess(AppConstants.FALSE);
			log.warn(AppConstants.REST_EXCEPTION + " Item list", re);
		} catch (Exception e) {
			response.setSuccess(AppConstants.FALSE);
			log.error(AppConstants.EXCEPTION + " Item list", e);
		}

		return response;
	}

	// Recipe Master DTO Save
	// =-=-=--=-==--=-=-=----=-=-=-=-=-=--=-=-=-=-=-=--=-==-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=--=--

	private String convertFilePathToUrl(String filePath) {
		if (filePath == null || filePath.trim().isEmpty()) {
			return null;
		}

		// Normalize slashes
		String normalizedPath = filePath.replace("\\", "/");

		// Find /Files/ folder in the path
		int index = normalizedPath.toLowerCase().indexOf("/files/");
		if (index == -1) {
			return null;
		}

		// Get relative path after /files/
		String relativePath = normalizedPath.substring(index);

		// Get current request info
		HttpServletRequest request = ((ServletRequestAttributes) RequestContextHolder.currentRequestAttributes())
				.getRequest();
		String scheme = request.getScheme(); // http/https
		String host = getServerIPv4(); // domain
		int port = request.getServerPort();

		String portPart = (port == 80 && "http".equalsIgnoreCase(scheme))
				|| (port == 443 && "https".equalsIgnoreCase(scheme)) ? "" : ":" + port;

		// Construct full URL dynamically
		return scheme + "://" + host + portPart + "/" + relativePath;
	}

	private String getServerIPv4() {
		try {
			Enumeration<NetworkInterface> interfaces = NetworkInterface.getNetworkInterfaces();
			while (interfaces.hasMoreElements()) {
				NetworkInterface ni = interfaces.nextElement();
				if (!ni.isUp() || ni.isLoopback())
					continue;

				Enumeration<InetAddress> addresses = ni.getInetAddresses();
				while (addresses.hasMoreElements()) {
					InetAddress addr = addresses.nextElement();
					if (addr instanceof Inet4Address && !addr.isLoopbackAddress()) {
						return addr.getHostAddress();
					}
				}
			}
		} catch (Exception e) {
			e.printStackTrace();
		}
		return "localhost"; // fallback
	}

	private final Path COMMON_JSON_DIR = Paths.get("C:/Esfita/Microservices/masters/webapps/AppData/", "Json");
	ObjectMapper mapper = new ObjectMapper();

	public ResponseDTO<RecipeMasterDTO> recipeMasterSave(RecipeMasterDTO dto, MultipartFile files) {

		ResponseDTO<RecipeMasterDTO> response = new ResponseDTO<>();

		try {
			// Generate new Unique ID
			String finalID = null;
			// PO means Purchase Order
			String ref = generateID("REC", new Date());
			ref += "%";
			List<RecipeHHib> requestHeader = recipeHRepository.transactionNo(ref);
			if (requestHeader != null && requestHeader.size() > ConstantIFC.ZERO) {
				int maxSuffix = 0;

				for (RecipeHHib rHib : requestHeader) {
					String returnNo = rHib.getUniqueNo();
					if (returnNo.startsWith(ref.substring(0, ref.length() - 1))) {
						try {
							int currentSuffix = Integer
									.parseInt(returnNo.replace(ref.substring(0, ref.length() - 1), ""));
							if (currentSuffix > maxSuffix) {
								maxSuffix = currentSuffix;
							}
						} catch (NumberFormatException e) {
							// Handle the case where RETURN_NO is not properly formatted.
						}
					}
				}

				finalID = generateID("REC", new Date(), maxSuffix + 1);
			} else {
				finalID = generateID("REC", new Date(), 1);
			}
			RecipeHHib recipehHib = new RecipeHHib();

			if (files != null && !files.isEmpty()) {
				MultipartFile file = files;

				if (!file.isEmpty()) {

					// Get base upload path from database
					AppPreferences app = appPreferrenceRepository.findAppPreferencesByEntityID();
					String baseUploadPath = app.getApFileUpload();

					// Dynamic folder for this recipe
					String uniqueNo = finalID;

					// Sanitize recipe name
					String recipeName = dto.getRecipeName().replaceAll("[^a-zA-Z0-9-_\\.]", "_");

					// Path to store the image
					Path recipeDir = Paths.get(baseUploadPath, uniqueNo);
					if (!Files.exists(recipeDir)) {
						Files.createDirectories(recipeDir);
					}

					// Path for current image
					Path imageFilePath = recipeDir.resolve(recipeName + ".png");

					// Backup old image if it exists
					if (Files.exists(imageFilePath)) {
						Path archiveDir = recipeDir.resolve("Previous");
						if (!Files.exists(archiveDir)) {
							Files.createDirectories(archiveDir);
						}

						String backupName = recipeName + "_" + new SimpleDateFormat("yyyyMMddHHmmss").format(new Date())
								+ ".png";
						Files.move(imageFilePath, archiveDir.resolve(backupName), StandardCopyOption.REPLACE_EXISTING);
					}

					// Save new uploaded file
					file.transferTo(imageFilePath.toFile());

					// Generate URL dynamically based on current request domain
					String imageUrl = convertFilePathToUrl(imageFilePath.toString());
					dto.setImageUrl(imageUrl);
				}
			}

			String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
			Path jsonPath = COMMON_JSON_DIR.resolve(dto.getRecipeName() + "_" + timestamp + ".json");
			String jsonData = mapper.writerWithDefaultPrettyPrinter().writeValueAsString(dto);

			Files.write(jsonPath, jsonData.getBytes(), StandardOpenOption.CREATE, StandardOpenOption.TRUNCATE_EXISTING);

			if (null != dto) {

				recipehHib.setUniqueNo(finalID);
				recipehHib.setRecipeName(dto.getRecipeName());
				recipehHib.setRefNo(dto.getRefNo());
				recipehHib.setCookingInstruction(dto.getCookingInstruction());
				recipehHib.setCountryOriginFk(dto.getCountryOriginFk());
				recipehHib.setBaseQuantityFk(dto.getBaseQuantityFk());
				recipehHib.setBaseQuantity(dto.getBaseQuantity());
				recipehHib.setUom(dto.getUom());
				recipehHib.setFinishedProduct(dto.getFinishedProduct());
				recipehHib.setPortionSize(dto.getPortionSize());
				recipehHib.setImageUrl(dto.getImageUrl());
				recipehHib.setTotalCost(dto.getTotalCost());
				recipehHib.setPerPortionCost(dto.getPerPortionCost());
				recipehHib.setStatus(AppConstants.FLAG_A);
				recipehHib.setVersionNo(1);
				recipehHib.setCreatedBy(dto.getCreatedBy());
				recipehHib.setCreatedDate(new Date());
				recipehHib.setUpdatedBy(dto.getCreatedBy());
				recipehHib.setUpdatedDate(new Date());
				recipehHib.setCalories(dto.getCalories());
				recipehHib.setProtein(dto.getCalories());
				recipehHib.setCarbs(dto.getCarbs());
				recipehHib.setFat(dto.getFat());

				RecipeHHib recipe = recipeHRepository.save(recipehHib);

				if (dto.getRecipeSubList() != null && !dto.getRecipeSubList().isEmpty()) {
					for (RecipeMasterDTO detailDTO : dto.getRecipeSubList()) {

						RecipeDHib detail = new RecipeDHib();

						detail.setRecipeFk(recipe.getId());
						detail.setCategoryFk(detailDTO.getItemCategoryFk());

						detail.setItemFk(detailDTO.getItemFk());

						ItemCategoryMasterHib item = itemCategoryMasterRepository
								.findById(detailDTO.getItemCategoryFk());
						detail.setCategoryName(item.getItemCategoryName());

						ItemMasterHib masterHib = itemMasterRepository.findByid(detailDTO.getItemFk());
						detail.setItemCode(masterHib.getItemCode());
						detail.setItemName(masterHib.getItemName());
						detail.setPackageId(masterHib.getPackageId());
						detail.setPackagePrice(masterHib.getPackagePrice());
						detail.setPackageBaseFactor(masterHib.getPackageBaseFactor());
						detail.setPackageSecondaryFactor(masterHib.getPackageSecondaryFactor());
						detail.setPackageBaseUnit(masterHib.getPackageBaseUnit());
						detail.setPackageSecondaryUnit(masterHib.getPackageSecondaryUnit());
						detail.setPackageSecondaryCost(masterHib.getPackageSecondaryCost());
						double baseQty = detailDTO.getSecondaryQuantity() / masterHib.getPackageSecondaryFactor();
						detail.setBaseQuantity(baseQty);
						detail.setSecondaryQuantity(detailDTO.getSecondaryQuantity());
						detail.setTotal(detailDTO.getTotal());
						detail.setStatus(AppConstants.FLAG_A);

						recipeDRepository.save(detail);
					}
				}

				for (String recipe2 : dto.getCategoryList()) {
					RecipeCategoryMappingHib recipes = new RecipeCategoryMappingHib();

					recipes.setRecipeFk(recipe.getId());
					recipes.setCategoryFk(Integer.parseInt(recipe2));
					recipes.setStatus(AppConstants.FLAG_A);
					recipes.setCreatedBy(dto.getCreatedBy());
					recipes.setCreatedDate(new Date());
					recipes.setUpdatedBy(dto.getCreatedBy());
					recipes.setUpdatedDate(new Date());

					recipeCategoryMappingRepository.save(recipes);
				}

				for (String recipe1 : dto.getMealtype()) {
					RecipeMealMappingHib mapping = new RecipeMealMappingHib();

					mapping.setMealFk(Integer.parseInt(recipe1));
					mapping.setRecipeFk(recipe.getId());
					mapping.setStatus(AppConstants.FLAG_A);
					mapping.setCreatedBy(dto.getCreatedBy());
					mapping.setCreatedDate(new Date());
					mapping.setUpdateBy(dto.getCreatedBy());
					mapping.setUpdatedDate(new Date());

					recipeMealMappingRepository.save(mapping);

				}
				RecipeHHistoryHib recipeHHistoryHib = new RecipeHHistoryHib();

				recipeHHistoryHib.setRecipeFk(recipe.getId());
				recipeHHistoryHib.setUniqueNo(finalID);
				recipeHHistoryHib.setRecipeName(dto.getRecipeName());
				recipeHHistoryHib.setRefNo(dto.getRefNo());
				recipeHHistoryHib.setCookingInstruction(dto.getCookingInstruction());
				recipeHHistoryHib.setCountryOriginFk(dto.getCountryOriginFk());
				recipeHHistoryHib.setBaseQuantityFk(dto.getBaseQuantityFk());
				recipeHHistoryHib.setBaseQuantity(dto.getBaseQuantity());
				recipeHHistoryHib.setUom(dto.getUom());
				recipeHHistoryHib.setFinishedProduct(dto.getFinishedProduct());
				recipeHHistoryHib.setPortionSize(dto.getPortionSize());
				recipeHHistoryHib.setImageUrl(dto.getImageUrl());
				recipeHHistoryHib.setTotalCost(dto.getTotalCost());
				recipeHHistoryHib.setPerPortionCost(dto.getPerPortionCost());
				recipeHHistoryHib.setStatus(AppConstants.FLAG_A);
				recipeHHistoryHib.setVersionNo(1);
				recipeHHistoryHib.setCreatedBy(dto.getCreatedBy());
				recipeHHistoryHib.setCreatedDate(new Date());
				recipeHHistoryHib.setUpdateBy(dto.getCreatedBy());
				recipeHHistoryHib.setUpdatedDate(new Date());
				recipeHHistoryHib.setCalories(dto.getCalories());
				recipeHHistoryHib.setProtein(dto.getCalories());
				recipeHHistoryHib.setCarbs(dto.getCarbs());
				recipeHHistoryHib.setFat(dto.getFat());

				RecipeHHistoryHib recipeH = recipeHHistoryRepository.save(recipeHHistoryHib);

				if (dto.getRecipeSubList() != null && !dto.getRecipeSubList().isEmpty()) {
					for (RecipeMasterDTO detailDTO1 : dto.getRecipeSubList()) {

						RecipeDHistoryHib detail1 = new RecipeDHistoryHib();

						detail1.setRecipeHistoryFk(recipeH.getId());
						detail1.setCategoryFk(detailDTO1.getItemCategoryFk());
						detail1.setItemFk(detailDTO1.getItemFk());

						ItemCategoryMasterHib itemCategoryMasterHib1 = itemCategoryMasterRepository
								.findById(detailDTO1.getItemCategoryFk());
						if (null != itemCategoryMasterHib1) {
							detail1.setCategoryName(itemCategoryMasterHib1.getItemCategoryName());
						} else {

							detail1.setCategoryName("");
						}

						ItemMasterHib itemMasterHib2 = itemMasterRepository.findByid(detailDTO1.getItemFk());
						if (null != itemMasterHib2) {
							detail1.setItemCode(itemMasterHib2.getItemCode());
							detail1.setItemName(itemMasterHib2.getItemName());
							detail1.setPackageId(itemMasterHib2.getPackageId());
							detail1.setPackagePrice(itemMasterHib2.getPackagePrice());
							detail1.setPackageBaseFactor(itemMasterHib2.getPackageBaseFactor());
							detail1.setPackageSecondaryFactor(itemMasterHib2.getPackageSecondaryFactor());
							detail1.setPackageBaseUnit(itemMasterHib2.getPackageBaseUnit());
							detail1.setPackageSecondaryUnit(itemMasterHib2.getPackageSecondaryUnit());
							detail1.setPackageSecondaryCost(itemMasterHib2.getPackageSecondaryCost());
							double baseQty = detailDTO1.getSecondaryQuantity()
									/ itemMasterHib2.getPackageSecondaryFactor();
							detail1.setBaseQuantity(baseQty);
							detail1.setSecondaryQuantity(detailDTO1.getSecondaryQuantity());
							detail1.setTotal(detailDTO1.getTotal());

							recipeDHistoryRepository.save(detail1);
						} else {
							response.setSuccess(AppConstants.FALSE);
							response.setMessage("Item id Not Found");
						}
					}

				}
				response.setSuccess(AppConstants.TRUE);
				response.setMessage(AppConstants.MSG_RECORD_CREATED);

			} else {
				response.setSuccess(AppConstants.FALSE);
				response.setMessage(AppConstants.E_DATA);

			}
		} catch (DataAccessException dae) {

			log.error("Database error while saving Recipe Master", dae);
			response.setSuccess(AppConstants.FALSE);
			response.setMessage("Database error occurred. Please try again later.");
		} catch (RestException re) {
			log.warn("REST exception while saving  Recipe Master", re);
			response.setSuccess(AppConstants.FALSE);
			response.setMessage(AppConstants.DATA_EXCEPTION_SAVE);
		} catch (Exception e) {
			log.error("Unexpected exception while saving Recipe Master", e);
			response.setSuccess(AppConstants.FALSE);
			response.setMessage("Unexpected error occurred. Please contact support.");
		}
		return response;
	}

	private static String generateID(String prefix, Date date) {
		String year = new SimpleDateFormat("yy").format(date);
		String month = new SimpleDateFormat("MM").format(date);

		return prefix + year + month;
	}

	private static String generateID(String prefix, Date date, Integer number) {

		String year = new SimpleDateFormat("yy").format(date);
		String month = new SimpleDateFormat("MM").format(date);

		NumberFormat decimalFormat = new DecimalFormat("0000");
		String x = decimalFormat.format(number);

		return prefix + year + month + x;
	}

	public ResponseDTO<RecipeMasterDTO> recipeMasterModify(RecipeMasterDTO dto, MultipartFile files) {
		ResponseDTO<RecipeMasterDTO> response = new ResponseDTO<>();
		try {
			RecipeHHib recipeEntity = recipeHRepository.findByRecipeFk(dto.getId());

			if (recipeEntity == null) {
				response.setSuccess(AppConstants.FALSE);
				response.setMessage("Recipe not found.");
				return response;
			} else {
				Integer maxVersion = recipeHHistoryRepository.findMaxVersionByRecipeFk(recipeEntity.getId());
				int newVersion = (maxVersion != null ? maxVersion + 1 : 1);

				if (files != null && !files.isEmpty() && !files.getOriginalFilename().isEmpty()) {

					AppPreferences app = appPreferrenceRepository.findAppPreferencesByEntityID();
					String baseUploadPath = app.getApFileUpload(); // e.g.,
																	// C:/Esfita/Microservices/masters/webapps/Files/

					String recipeName = dto.getRecipeName().replaceAll("[^a-zA-Z0-9-_\\.]", "_");
					Path recipeDir = Paths.get(baseUploadPath, dto.getUniqueNo());
					Path imageFilePath = recipeDir.resolve(recipeName + ".png");

					// Create recipe directory if it does not exist
					if (!Files.exists(recipeDir)) {
						Files.createDirectories(recipeDir);
					}

					// Backup old image if it exists
					if (Files.exists(imageFilePath)) {
						Path archiveDir = recipeDir.resolve("Previous");
						if (!Files.exists(archiveDir)) {
							Files.createDirectories(archiveDir);
						}

						String backupName = recipeName + "_" + new SimpleDateFormat(DATE_FORMAT).format(new Date())
								+ ".png";
						Files.move(imageFilePath, archiveDir.resolve(backupName), StandardCopyOption.REPLACE_EXISTING);
					}

					// Save new uploaded file
					files.transferTo(imageFilePath.toFile());

					// Generate URL dynamically based on current request domain
					String imageUrl = convertFilePathToUrl(imageFilePath.toString());
					dto.setImageUrl(imageUrl);
				}

				recipeEntity.setRecipeName(dto.getRecipeName());
				recipeEntity.setRefNo(dto.getRefNo());
				recipeEntity.setVersionNo(newVersion);
				recipeEntity.setCookingInstruction(dto.getCookingInstruction());
				recipeEntity.setCountryOriginFk(dto.getCountryOriginFk());
				recipeEntity.setBaseQuantityFk(dto.getBaseQuantityFk());
				recipeEntity.setBaseQuantity(dto.getBaseQuantity());
				recipeEntity.setUom(dto.getUom());
				recipeEntity.setFinishedProduct(dto.getFinishedProduct());
				recipeEntity.setPortionSize(dto.getPortionSize());
				recipeEntity.setImageUrl(dto.getImageUrl());
				recipeEntity.setTotalCost(dto.getTotalCost());
				recipeEntity.setPerPortionCost(dto.getPerPortionCost());
				recipeEntity.setCalories(dto.getCalories());
				recipeEntity.setProtein(dto.getProtein());
				recipeEntity.setCarbs(dto.getCarbs());
				recipeEntity.setFat(dto.getFat());
				recipeEntity.setStatus(AppConstants.FLAG_A);
				recipeEntity.setUpdatedDate(new Date());
				recipeEntity.setUpdatedBy(dto.getCreatedBy());
				recipeHRepository.save(recipeEntity);

				List<RecipeDHib> existingDetails = recipeDRepository.findByRecipe(recipeEntity.getId());

				for (RecipeMasterDTO detailDTO : dto.getRecipeSubList()) {
					RecipeDHib detail = null;

					if (detailDTO.getItemFk() != 0 && detailDTO.getItemFk() != 0) {
						detail = existingDetails.stream().filter(d -> d.getItemFk() == (detailDTO.getItemFk()))
								.findFirst().orElse(null);
					}
					if (detail == null) {
						detail = new RecipeDHib();
						detail.setRecipeFk(recipeEntity.getId());
					}

					detail.setCategoryFk(detailDTO.getItemCategoryFk());
					detail.setItemFk(detailDTO.getItemFk());

					ItemCategoryMasterHib cat = itemCategoryMasterRepository.findById(detailDTO.getItemCategoryFk());
					detail.setCategoryName(cat != null ? cat.getItemCategoryName() : null);

					ItemMasterHib item = itemMasterRepository.findByid(detailDTO.getItemFk());
					if (item != null) {
						detail.setItemCode(item.getItemCode());
						detail.setItemName(item.getItemName());
					} else {
						detail.setItemCode(null);
						detail.setItemName(null);
					}

					detail.setPackageId(item.getPackageId());
					detail.setPackagePrice(item.getPackagePrice());
					detail.setPackageBaseFactor(item.getPackageBaseFactor());
					detail.setPackageSecondaryFactor(item.getPackageSecondaryFactor());
					detail.setPackageBaseUnit(item.getPackageBaseUnit());
					detail.setPackageSecondaryUnit(item.getPackageSecondaryUnit());
					detail.setPackageSecondaryCost(item.getPackageSecondaryCost());
					double baseQty = detailDTO.getSecondaryQuantity() / item.getPackageSecondaryFactor();
					detail.setBaseQuantity(baseQty);
					detail.setSecondaryQuantity(detailDTO.getSecondaryQuantity());
					detail.setStatus(AppConstants.FLAG_A);
					detail.setTotal(detailDTO.getTotal());

					recipeDRepository.save(detail);
				}
				Set<Integer> incomingItemFks = dto.getRecipeSubList().stream().map(RecipeMasterDTO::getItemFk)
						.collect(Collectors.toSet());

				for (RecipeDHib existing : existingDetails) {
					if (!incomingItemFks.contains(existing.getItemFk())) {
						existing.setStatus(AppConstants.FLAG_I); // Mark as inactive
						recipeDRepository.save(existing);
					}
				}

				List<RecipeCategoryMappingHib> existingCategoryMappings = recipeCategoryMappingRepository
						.findByRecipeFk(recipeEntity.getId());

				Set<Integer> incomingCategoryFks = dto.getCategoryList().stream().map(Integer::parseInt)
						.collect(Collectors.toSet());

				Map<Integer, RecipeCategoryMappingHib> existingCategoryMap = existingCategoryMappings.stream()
						.collect(Collectors.toMap(RecipeCategoryMappingHib::getCategoryFk, c -> c));

				for (Integer catFk : incomingCategoryFks) {
					RecipeCategoryMappingHib mapping = existingCategoryMap.get(catFk);

					if (mapping == null) {
						mapping = new RecipeCategoryMappingHib();
						mapping.setRecipeFk(recipeEntity.getId());
						mapping.setCategoryFk(catFk);
						mapping.setCreatedBy(dto.getCreatedBy());
						mapping.setCreatedDate(new Date());
					}

					mapping.setStatus(AppConstants.FLAG_A);
					mapping.setUpdatedBy(dto.getCreatedBy());
					mapping.setUpdatedDate(new Date());

					recipeCategoryMappingRepository.save(mapping);
				}

				for (RecipeCategoryMappingHib existingMapping : existingCategoryMappings) {
					if (!incomingCategoryFks.contains(existingMapping.getCategoryFk())) {
						existingMapping.setStatus(AppConstants.FLAG_I);
						existingMapping.setUpdatedBy(dto.getCreatedBy());
						existingMapping.setUpdatedDate(new Date());
						recipeCategoryMappingRepository.save(existingMapping);
					}
				}

				List<RecipeMealMappingHib> existingMealMappings = recipeMealMappingRepository
						.findByRecipeFk(recipeEntity.getId());

				Set<Integer> incomingMealFks = dto.getMealtype().stream().map(Integer::parseInt)
						.collect(Collectors.toSet());

				Map<Integer, RecipeMealMappingHib> existingMealMap = existingMealMappings.stream()
						.collect(Collectors.toMap(RecipeMealMappingHib::getMealFk, m -> m));

				for (Integer mealFk : incomingMealFks) {
					RecipeMealMappingHib mealMap = existingMealMap.get(mealFk);

					if (mealMap == null) {
						mealMap = new RecipeMealMappingHib();
						mealMap.setRecipeFk(recipeEntity.getId());
						mealMap.setMealFk(mealFk);
						mealMap.setCreatedBy(dto.getCreatedBy());
						mealMap.setCreatedDate(new Date());
					}

					mealMap.setStatus(AppConstants.FLAG_A); // 'A' for active
					mealMap.setUpdateBy(dto.getCreatedBy());
					mealMap.setUpdatedDate(new Date());

					recipeMealMappingRepository.save(mealMap);
				}

				for (RecipeMealMappingHib existing : existingMealMappings) {
					if (!incomingMealFks.contains(existing.getMealFk())) {
						existing.setStatus(AppConstants.FLAG_I); // 'I' for inactive
						existing.setUpdateBy(dto.getCreatedBy());
						existing.setUpdatedDate(new Date());
						recipeMealMappingRepository.save(existing);
					}
				}

				RecipeHHistoryHib hist = new RecipeHHistoryHib();
				hist.setRecipeFk(recipeEntity.getId());
				hist.setUniqueNo(dto.getUniqueNo());
				hist.setVersionNo(newVersion);
				hist.setRecipeName(dto.getRecipeName());
				hist.setRefNo(dto.getRefNo());
				hist.setCookingInstruction(dto.getCookingInstruction());
				hist.setCountryOriginFk(dto.getCountryOriginFk());
				hist.setBaseQuantityFk(dto.getBaseQuantityFk());
				hist.setBaseQuantity(dto.getBaseQuantity());
				hist.setUom(dto.getUom());
				hist.setFinishedProduct(dto.getFinishedProduct());
				hist.setPortionSize(dto.getPortionSize());
				hist.setImageUrl(dto.getImageUrl());
				hist.setTotalCost(dto.getTotalCost());
				hist.setPerPortionCost(dto.getPerPortionCost());
				hist.setCalories(dto.getCalories());
				hist.setProtein(dto.getProtein());
				hist.setCarbs(dto.getCarbs());
				hist.setFat(dto.getFat());
				hist.setStatus(AppConstants.FLAG_A);
				hist.setCreatedBy(dto.getCreatedBy());
				hist.setCreatedDate(new Date());
				hist.setUpdateBy(dto.getCreatedBy());
				hist.setUpdatedDate(new Date());
				recipeHHistoryRepository.save(hist);

				// Save RECIPE_D_HISTORY
				for (RecipeMasterDTO detailDTO : dto.getRecipeSubList()) {
					RecipeDHistoryHib histDetail = new RecipeDHistoryHib();
					histDetail.setRecipeHistoryFk(hist.getId());
					histDetail.setCategoryFk(detailDTO.getItemCategoryFk());
					histDetail.setItemFk(detailDTO.getItemFk());

					ItemCategoryMasterHib cat = itemCategoryMasterRepository.findById(detailDTO.getItemCategoryFk());
					if (cat != null) {
						histDetail.setCategoryName(cat.getItemCategoryName());
					} else {
						histDetail.setCategoryName(null);
					}

					ItemMasterHib item = itemMasterRepository.findByid(detailDTO.getItemFk());
					if (item != null) {
						histDetail.setItemCode(item.getItemCode());
						histDetail.setItemName(item.getItemName());
						histDetail.setPackagePrice(item.getPackagePrice());
						histDetail.setPackageBaseFactor(item.getPackageBaseFactor());
						histDetail.setPackageSecondaryFactor(item.getPackageSecondaryFactor());
						histDetail.setPackageBaseUnit(item.getPackageBaseUnit());
						histDetail.setPackageSecondaryUnit(item.getPackageSecondaryUnit());
						histDetail.setPackageSecondaryCost(item.getPackageSecondaryCost());
						histDetail.setPackageId(item.getPackageId());
						double baseQty = detailDTO.getSecondaryQuantity() / item.getPackageSecondaryFactor();
						histDetail.setBaseQuantity(baseQty);
						histDetail.setSecondaryQuantity(detailDTO.getSecondaryQuantity());
						histDetail.setTotal(detailDTO.getTotal());

						recipeDHistoryRepository.save(histDetail);
					} else {
						histDetail.setItemCode(null);
						histDetail.setItemName(null);
					}

				}

				response.setSuccess(AppConstants.TRUE);
				response.setMessage(AppConstants.MSG_RECORD_UPDATED);
			}
		} catch (Exception e) {
			log.error("Error in recipeMasterSave", e);
			response.setSuccess(AppConstants.FALSE);
			response.setMessage("Unexpected error occurred.");
		}
		return response;
	}

	public ResponseDTO<RecipeMasterDTO> saveRecipeCopy(RecipeMasterDTO dto) {
		ResponseDTO<RecipeMasterDTO> response = new ResponseDTO<>();

		try {
			if (dto.getId() == 0) {
				response.setSuccess(AppConstants.FALSE);
				response.setMessage("Invalid ID. Cannot copy recipe.");
				return response;
			}

			RecipeHHib original = recipeHRepository.findByRecipeFk(dto.getId());
			if (original == null) {
				response.setSuccess(AppConstants.FALSE);
				response.setMessage("Original recipe not found.");
				return response;
			}

			// Generate new Unique ID
			String finalID = null;
			// PO means Purchase Order
			String ref = generateID("REC", new Date());
			ref += "%";
			List<RecipeHHib> requestHeader = recipeHRepository.transactionNo(ref);
			if (requestHeader != null && requestHeader.size() > ConstantIFC.ZERO) {
				int maxSuffix = 0;

				for (RecipeHHib rHib : requestHeader) {
					String returnNo = rHib.getUniqueNo();
					if (returnNo.startsWith(ref.substring(0, ref.length() - 1))) {
						try {
							int currentSuffix = Integer
									.parseInt(returnNo.replace(ref.substring(0, ref.length() - 1), ""));
							if (currentSuffix > maxSuffix) {
								maxSuffix = currentSuffix;
							}
						} catch (NumberFormatException e) {
							// Handle the case where RETURN_NO is not properly formatted.
						}
					}
				}

				finalID = generateID("REC", new Date(), maxSuffix + 1);
			} else {
				finalID = generateID("REC", new Date(), 1);
			}

			// Create new Header entity
			RecipeHHib newHeader = new RecipeHHib();
			newHeader.setUniqueNo(finalID);
			newHeader.setRecipeName(dto.getNewRecipeName());
			newHeader.setRefNo(original.getRefNo());
			newHeader.setCookingInstruction(original.getCookingInstruction());
			newHeader.setCountryOriginFk(original.getCountryOriginFk());
			newHeader.setBaseQuantityFk(original.getBaseQuantityFk());
			newHeader.setBaseQuantity(original.getBaseQuantity());
			newHeader.setUom(original.getUom());
			newHeader.setFinishedProduct(original.getFinishedProduct());
			newHeader.setPortionSize(original.getPortionSize());
			newHeader.setImageUrl(original.getImageUrl());
			newHeader.setTotalCost(original.getTotalCost());
			newHeader.setPerPortionCost(original.getPerPortionCost());
			newHeader.setStatus(AppConstants.FLAG_A);
			newHeader.setVersionNo(1);
			newHeader.setCreatedBy(dto.getCreatedBy());
			newHeader.setCreatedDate(new Date());
			newHeader.setUpdatedBy(dto.getCreatedBy());
			newHeader.setUpdatedDate(new Date());
			newHeader.setCalories(original.getCalories());
			newHeader.setProtein(original.getProtein());
			newHeader.setCarbs(original.getCarbs());
			newHeader.setFat(original.getFat());

			recipeHRepository.save(newHeader);

			// Copy Details
			List<RecipeDHib> originalDetails = recipeDRepository.findByActRecipe(original.getId());
			if (originalDetails != null) {
				for (RecipeDHib detailDTO : originalDetails) {
					RecipeDHib detail = new RecipeDHib();
					detail.setRecipeFk(newHeader.getId());
					detail.setCategoryFk(detailDTO.getCategoryFk());
					detail.setItemFk(detailDTO.getItemFk());

					ItemCategoryMasterHib cat = itemCategoryMasterRepository.findById(detailDTO.getCategoryFk());
					detail.setCategoryName(cat != null ? cat.getItemCategoryName() : "");

					ItemMasterHib item = itemMasterRepository.findByid(detailDTO.getItemFk());
					if (item != null) {
						detail.setItemCode(item.getItemCode());
						detail.setItemName(item.getItemName());
						detail.setPackageId(item.getPackageId());
						detail.setPackagePrice(item.getPackagePrice());
						detail.setPackageBaseFactor(item.getPackageBaseFactor());
						detail.setPackageSecondaryFactor(item.getPackageSecondaryFactor());
						detail.setPackageBaseUnit(item.getPackageBaseUnit());
						detail.setPackageSecondaryUnit(item.getPackageSecondaryUnit());
						detail.setPackageSecondaryCost(item.getPackageSecondaryCost());
						double baseQty = detailDTO.getSecondaryQuantity() / item.getPackageSecondaryFactor();
						detail.setBaseQuantity(baseQty);
						detail.setSecondaryQuantity(detailDTO.getSecondaryQuantity());
						detail.setTotal(detailDTO.getTotal());
						detail.setStatus(AppConstants.FLAG_A);

						recipeDRepository.save(detail);
					}
				}
			}

			// Copy Category Mappings
			List<RecipeCategoryMappingHib> catMaps = recipeCategoryMappingRepository.findByIdAndAct(original.getId());
			if (catMaps != null) {
				for (RecipeCategoryMappingHib catMap : catMaps) {
					RecipeCategoryMappingHib newCatMap = new RecipeCategoryMappingHib();
					newCatMap.setRecipeFk(newHeader.getId());
					newCatMap.setCategoryFk(catMap.getCategoryFk());
					newCatMap.setStatus(AppConstants.FLAG_A);
					newCatMap.setCreatedBy(dto.getCreatedBy());
					newCatMap.setCreatedDate(new Date());
					newCatMap.setUpdatedBy(dto.getCreatedBy());
					newCatMap.setUpdatedDate(new Date());

					recipeCategoryMappingRepository.save(newCatMap);
				}
			}

			// Copy Meal Mappings
			List<RecipeMealMappingHib> mealMaps = recipeMealMappingRepository.findByIdAndAct(original.getId());
			if (mealMaps != null) {
				for (RecipeMealMappingHib mealMap : mealMaps) {
					RecipeMealMappingHib newMealMap = new RecipeMealMappingHib();
					newMealMap.setRecipeFk(newHeader.getId());
					newMealMap.setMealFk(mealMap.getMealFk());
					newMealMap.setStatus(AppConstants.FLAG_A);
					newMealMap.setCreatedBy(dto.getCreatedBy());
					newMealMap.setCreatedDate(new Date());
					newMealMap.setUpdateBy(dto.getCreatedBy());
					newMealMap.setUpdatedDate(new Date());

					recipeMealMappingRepository.save(newMealMap);
				}
			}

			// Save Header History
			RecipeHHistoryHib historyHeader = new RecipeHHistoryHib();
			historyHeader.setRecipeFk(newHeader.getId());
			historyHeader.setUniqueNo(finalID);
			historyHeader.setRecipeName(dto.getNewRecipeName());
			historyHeader.setRefNo(original.getRefNo());
			historyHeader.setCookingInstruction(original.getCookingInstruction());
			historyHeader.setCountryOriginFk(original.getCountryOriginFk());
			historyHeader.setBaseQuantityFk(original.getBaseQuantityFk());

			historyHeader.setBaseQuantity(original.getBaseQuantity());
			historyHeader.setUom(original.getUom());
			historyHeader.setFinishedProduct(original.getFinishedProduct());
			historyHeader.setPortionSize(original.getPortionSize());
			historyHeader.setImageUrl(original.getImageUrl());
			historyHeader.setTotalCost(original.getTotalCost());
			historyHeader.setPerPortionCost(original.getPerPortionCost());
			historyHeader.setStatus(AppConstants.FLAG_A);
			historyHeader.setVersionNo(1);
			historyHeader.setCreatedBy(dto.getCreatedBy());
			historyHeader.setCreatedDate(new Date());
			historyHeader.setUpdateBy(dto.getCreatedBy());
			historyHeader.setUpdatedDate(new Date());
			historyHeader.setCalories(original.getCalories());
			historyHeader.setProtein(original.getProtein());
			historyHeader.setCarbs(original.getCarbs());
			historyHeader.setFat(original.getFat());

			recipeHHistoryRepository.save(historyHeader);

			// Save Detail History
			if (originalDetails != null) {
				for (RecipeDHib detailDTO : originalDetails) {
					RecipeDHistoryHib histDetail = new RecipeDHistoryHib();
					histDetail.setRecipeHistoryFk(historyHeader.getId());
					histDetail.setCategoryFk(detailDTO.getCategoryFk());
					histDetail.setItemFk(detailDTO.getItemFk());

					ItemCategoryMasterHib cat = itemCategoryMasterRepository.findById(detailDTO.getCategoryFk());
					histDetail.setCategoryName(cat != null ? cat.getItemCategoryName() : "");

					ItemMasterHib item = itemMasterRepository.findByid(detailDTO.getItemFk());
					if (item != null) {
						histDetail.setItemCode(item.getItemCode());
						histDetail.setItemName(item.getItemName());
						histDetail.setPackageId(detailDTO.getPackageId());
						histDetail.setPackagePrice(item.getPackagePrice());
						histDetail.setPackageBaseFactor(item.getPackageBaseFactor());
						histDetail.setPackageSecondaryFactor(item.getPackageSecondaryFactor());
						histDetail.setPackageBaseUnit(item.getPackageBaseUnit());
						histDetail.setPackageSecondaryUnit(item.getPackageSecondaryUnit());
						histDetail.setPackageSecondaryCost(item.getPackageSecondaryCost());
						double baseQty = detailDTO.getSecondaryQuantity() / item.getPackageSecondaryFactor();
						histDetail.setBaseQuantity(baseQty);
						histDetail.setSecondaryQuantity(detailDTO.getSecondaryQuantity());
						histDetail.setTotal(detailDTO.getTotal());

						recipeDHistoryRepository.save(histDetail);
					}
				}
			}

			response.setSuccess(AppConstants.TRUE);
			response.setMessage("Recipe Copied Successfully");

		} catch (DataAccessException dae) {
			log.error("Database error while saving recipe copy", dae);
			response.setSuccess(AppConstants.FALSE);
			response.setMessage("Database error occurred. Please try again later.");
		} catch (Exception e) {
			log.error("Unexpected error during recipe copy", e);
			response.setSuccess(AppConstants.FALSE);
			response.setMessage("Unexpected error occurred. Please contact support.");
		}

		return response;
	}

	public ResponseDTO<List<RecipeListingDTO>> recipeListing(RecipeListingDTO recipeListingDTO) {
		ResponseDTO<List<RecipeListingDTO>> response = new ResponseDTO<>();
		List<RecipeListingDTO> recipeListing = new ArrayList<>();

		try {
			Integer origin = recipeListingDTO.getCuisinesFk();
			origin = (origin != null && origin == 0) ? null : origin;

			Integer mealType = recipeListingDTO.getMealTypeFk();
			mealType = (mealType != null && mealType == 0) ? null : mealType;

			Integer category = recipeListingDTO.getCategoryFk();
			category = (category != null && category == 0) ? null : category;

			// 1️⃣ Fetch recipes using native query
			List<RecipeHHib> recipeList = recipeHRepository.filterRecipeMappingNative(origin, mealType, category);

			if (recipeList != null && !recipeList.isEmpty()) {

				List<Integer> recipeIds = recipeList.stream().map(RecipeHHib::getId).toList();

				// 2️⃣ Bulk fetch mappings and masters
				Map<Integer, CountryMasterHib> countryMap = countryMasterRepository.findAll().stream()
						.collect(Collectors.toMap(CountryMasterHib::getId, c -> c));

				List<RecipeCategoryMappingHib> categoryMappings = recipeCategoryMappingRepository
						.findActiveByRecipeFkIn(recipeIds);
				Map<Integer, List<RecipeCategoryMappingHib>> categoryMapGrouped = categoryMappings.stream()
						.collect(Collectors.groupingBy(RecipeCategoryMappingHib::getRecipeFk));

				Map<Integer, MstCategoryMasterHib> categoryMasterMap = mstCategoryMasterRepository.findAll().stream()
						.collect(Collectors.toMap(MstCategoryMasterHib::getId, c -> c));

				List<RecipeMealMappingHib> mealMappings = recipeMealMappingRepository.findByRecipeFkIn(recipeIds);
				Map<Integer, List<RecipeMealMappingHib>> mealMapGrouped = mealMappings.stream()
						.collect(Collectors.groupingBy(RecipeMealMappingHib::getRecipeFk));

				Map<Integer, RecipeMealMasterHib> mealMasterMap = recipeMealMasterRepository.findAll().stream()
						.collect(Collectors.toMap(RecipeMealMasterHib::getId, m -> m));

				// 3️⃣ Map DTOs
				for (RecipeHHib hib : recipeList) {

					RecipeListingDTO dto = new RecipeListingDTO();
					dto.setId(hib.getId());
					dto.setRecipeName(hib.getRecipeName());
					dto.setRefNo(hib.getRefNo());
					dto.setTotalCost(hib.getTotalCost());
					dto.setServings(hib.getFinishedProduct());
					dto.setPerPortionCost(hib.getPerPortionCost());
					dto.setStatus(hib.getStatus());
					dto.setStatusStr(
							AppConstants.FLAG_A == hib.getStatus() ? AppConstants.ACTIVE : AppConstants.IN_ACTIVE);

					// COUNTRY
					CountryMasterHib country = countryMap.get(hib.getCountryOriginFk());
					dto.setCuisineName(country != null ? country.getCountryName() : "N/A");

					// CATEGORY
					List<RecipeListingDTO> categoryList = new ArrayList<>();
					List<RecipeCategoryMappingHib> catHib = categoryMapGrouped.get(hib.getId());
					if (catHib != null) {
						for (RecipeCategoryMappingHib chib : catHib) {
							RecipeListingDTO Cdto = new RecipeListingDTO();
							MstCategoryMasterHib caHib = categoryMasterMap.get(chib.getCategoryFk());
							Cdto.setCategoryName(caHib != null ? caHib.getCategoryName() : "");
							categoryList.add(Cdto);
						}
					}
					dto.setCategoryList(categoryList);

					// MEAL
					List<RecipeListingDTO> mealList = new ArrayList<>();
					List<RecipeMealMappingHib> mealHib = mealMapGrouped.get(hib.getId());
					if (mealHib != null) {
						for (RecipeMealMappingHib mhib : mealHib) {
							RecipeListingDTO Mdto = new RecipeListingDTO();
							RecipeMealMasterHib meHib = mealMasterMap.get(mhib.getMealFk());
							Mdto.setMealName(meHib != null ? meHib.getRecipeMealName() : "");
							mealList.add(Mdto);
						}
					}
					dto.setMealList(mealList);

					recipeListing.add(dto);
				}

				response.setData(recipeListing);
				response.setSuccess(AppConstants.TRUE);
				response.setMessage(AppConstants.MSG_RECORD_FETCHED);
				log.info("<----Recipe Details fetched Successfully, No of records--> " + recipeListing.size());

			} else {
				response.setSuccess(AppConstants.FALSE);
				response.setMessage(AppConstants.IS_EMPTY);
			}

		} catch (Exception e) {
			response.setSuccess(AppConstants.FALSE);
			log.error(AppConstants.EXCEPTION + " Recipe list", e);
		}
		return response;
	}

//	
	public ResponseDTO<RecipeListingDTO> recipeListView(int id) {
		ResponseDTO<RecipeListingDTO> response = new ResponseDTO<>();
		try {
			RecipeHHib recipe = recipeHRepository.findByRecipeFk(id);
			if (recipe == null) {
				return createErrorResponse(response, "Recipe not found for ID: " + id);
			}

			RecipeListingDTO dto = buildRecipeDTO(recipe);
			response.setData(dto);
			response.setSuccess(AppConstants.TRUE);
			response.setMessage(AppConstants.MSG_RECORD_FETCHED);
			log.info("Recipe Details fetched successfully for ID: {}", id);
		} catch (RestException re) {
			log.warn(AppConstants.REST_EXCEPTION + " Recipe not found with ID: {}", id, re);
			response.setSuccess(AppConstants.FALSE);
			response.setMessage(AppConstants.REST_EXCEPTION);
		} catch (Exception e) {
			log.error(AppConstants.EXCEPTION + " Recipe fetch by ID", e);
			response.setSuccess(AppConstants.FALSE);
			response.setMessage(AppConstants.EXCEPTION);
		}
		log.info("Recipe view process completed for ID: {}", id);
		return response;
	}

	private ResponseDTO<RecipeListingDTO> createErrorResponse(ResponseDTO<RecipeListingDTO> response, String message) {
		response.setSuccess(AppConstants.FALSE);
		response.setMessage(AppConstants.EMPTY + message);
		log.warn(message);
		return response;
	}

	private RecipeListingDTO buildRecipeDTO(RecipeHHib recipe) {
		RecipeListingDTO dto = new RecipeListingDTO();
		dto.setId(recipe.getId());
		dto.setRecipeName(recipe.getRecipeName());
		dto.setRefNo(recipe.getRefNo());
		dto.setCuisineName(getCuisineName(recipe.getCountryOriginFk()));
		dto.setCategoryListName(buildCategoryList(recipe.getId()));
		dto.setStatusStr(recipe.getStatus() == AppConstants.FLAG_A ? AppConstants.ACTIVE : AppConstants.IN_ACTIVE);
		dto.setMealList(buildMealList(recipe.getId()));
		dto.setPortionSize(recipe.getPortionSize());
		dto.setUom(recipe.getUom());
		dto.setBaseQuantity(recipe.getBaseQuantity());
		dto.setFinishedProduct(recipe.getFinishedProduct());
		dto.setTotalCost(recipe.getTotalCost());
		dto.setPerPortionCost(recipe.getPerPortionCost());
		dto.setProtein(recipe.getProtein());
		dto.setCalories(recipe.getCalories());
		dto.setCarbs(recipe.getCarbs());
		dto.setFat(recipe.getFat());
		dto.setUserName(getUserName(recipe.getUpdatedBy()));
		dto.setCreatedDate(recipe.getCreatedDate());
		dto.setUpdatedDate(recipe.getUpdatedDate());
		dto.setCookingInstruction(recipe.getCookingInstruction().replace("\\n", "\n"));
		dto.setImageUrl(recipe.getImageUrl());

		List<RecipeListingDTO> itemList = buildItemList(recipe.getId());
		dto.setRecipeSubList(itemList);
		dto.setItemCount(itemList.size());

		return dto;
	}

	private String getCuisineName(int countryOriginFk) {
		CountryMasterHib country = countryMasterRepository.findOne(countryOriginFk);
		return country != null ? country.getCountryName() : "";
	}

	private List<RecipeListingDTO> buildCategoryList(int recipeId) {
		List<RecipeListingDTO> categoryList = new ArrayList<>();
		List<RecipeCategoryMappingHib> categories = recipeCategoryMappingRepository.findByIdAndAct(recipeId);
		for (RecipeCategoryMappingHib category : categories) {
			RecipeListingDTO cdto = new RecipeListingDTO();
			CategoryMasterHib catMaster = categoryMasterRepository.findById(category.getCategoryFk());
			cdto.setCategoryName(catMaster != null ? catMaster.getCategoryName() : "");
			categoryList.add(cdto);
		}
		return categoryList;
	}

	private List<RecipeListingDTO> buildMealList(int recipeId) {
		List<RecipeListingDTO> mealList = new ArrayList<>();
		List<RecipeMealMappingHib> meals = recipeMealMappingRepository.findByIdAndAct(recipeId);
		for (RecipeMealMappingHib meal : meals) {
			RecipeListingDTO mdto = new RecipeListingDTO();
			RecipeMealMasterHib mealMaster = recipeMealMasterRepository.findByRecipeMealId(meal.getMealFk());
			mdto.setMealName(mealMaster != null ? mealMaster.getRecipeMealName() : "");
			mealList.add(mdto);
		}
		return mealList;
	}

	private List<RecipeListingDTO> buildItemList(int recipeId) {
		List<RecipeListingDTO> itemList = new ArrayList<>();
		List<RecipeDHib> items = recipeDRepository.findByActRecipe(recipeId);
		if (items != null) {
			for (RecipeDHib item : items) {
				RecipeListingDTO ddto = new RecipeListingDTO();
				ItemCategoryMasterHib itemCategory = itemCategoryMasterRepository.findById(item.getCategoryFk());
				ddto.setItemCategoryName(itemCategory != null ? itemCategory.getItemCategoryName() : "");
				ddto.setItemFk(item.getId());
				ddto.setItemCode(item.getItemCode());
				ddto.setItemName(item.getItemName());
				ddto.setPackageId(item.getPackageId());
				ddto.setPackagePrice(item.getPackagePrice());
				ddto.setChefUnit(item.getPackageSecondaryUnit());
				ddto.setCostPrice(item.getPackageSecondaryCost());
				ddto.setQuantity(item.getSecondaryQuantity());
				ddto.setTotal(item.getTotal());
				itemList.add(ddto);
			}
		}
		return itemList;
	}

	private String getUserName(int userId) {
		if (userId <= 0) {
			log.warn("Invalid userId provided: {}", userId);
			return "";
		}

		MstUserHib user = mstUserRepository.findByUserId(userId);
		if (user == null || user.getFirstName() == null) {
			log.info("User or first name not found for userId: {}", userId);
			return "";
		}

		log.debug("First name retrieved: {} for userId: {}", user.getFirstName(), userId);
		return user.getFirstName();
	}

	String username = null;

	public ResponseEntity<byte[]> printexcelreport(int id, int userId) {
		try {
			ResponseDTO<RecipeMasterDTO> response = recipeViewById(id);
			RecipeMasterDTO recipeMasterDTO = response.getData();

			username = fetchUserName(userId);
			// Check if data is empty - return empty Excel
			if (recipeMasterDTO == null || recipeMasterDTO.getRecipeSubList() == null
					|| recipeMasterDTO.getRecipeSubList().isEmpty()) {
				log.info("No recipe data found for ID: {}", id);
				return createEmptyExcelResponse();
			}

			try (Workbook workbook = new HSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
				// Create styles
				CellStyle headerStyle = createHeaderStyle(workbook);
				CellStyle boldStyle = createBoldStyle(workbook);
				CellStyle stringStyle = createStringStyle(workbook);

				CellStyle centerStyle = createCenterStyle(workbook);
				CellStyle numberStyle = createNumberStyle(workbook);

				// Create sheet
				createRecipeReportSheet(workbook, headerStyle, boldStyle, stringStyle, centerStyle, numberStyle,
						recipeMasterDTO);

				// Write to stream
				workbook.write(out);
				byte[] excelBytes = out.toByteArray();

				log.info("Excel report generated successfully for recipe ID: {}", id);
				return createSuccessResponse(excelBytes);
			}
		} catch (Exception e) {
			log.error(AppConstants.EXCEPTION + " Error generating Excel report for recipe ID: {}", id, e);
			return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	// Simulated recipeList method (based on recipeViewById)

	// Create empty Excel when no data found
	private ResponseEntity<byte[]> createEmptyExcelResponse() throws IOException {
		try (Workbook workbook = new HSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
			Sheet sheet = workbook.createSheet("No Data");
			Row row = sheet.createRow(0);
			Cell cell = row.createCell(0);
			cell.setCellValue("No meal set templates found for the given criteria");
			sheet.autoSizeColumn(0);
			workbook.write(out);
			byte[] excelBytes = out.toByteArray();
			return createSuccessResponse(excelBytes);
		}
	}

	// Create success response with headers
	private ResponseEntity<byte[]> createSuccessResponse(byte[] excelBytes) {
		HttpHeaders headers = new HttpHeaders();
		headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
		headers.setContentDispositionFormData("attachment",
				"MealSetTemplateReport_" + new SimpleDateFormat(DATE_FORMAT).format(new Date()) + ".xls");
		return new ResponseEntity<>(excelBytes, headers, HttpStatus.OK);
	}

	// ======================
	// Styles
	// ======================
	private CellStyle createHeaderStyle(Workbook workbook) {
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
		style.setBorderBottom(BorderStyle.THIN);
		style.setBorderTop(BorderStyle.THIN);
		style.setBorderLeft(BorderStyle.THIN);
		style.setBorderRight(BorderStyle.THIN);

		font.setColor(IndexedColors.BLUE.getIndex());
		style.setFont(font);
		return style;
	}

	private CellStyle createStringStyle(Workbook workbook) {
		CellStyle style = workbook.createCellStyle();
		style.setBorderBottom(BorderStyle.THIN);
		style.setBorderTop(BorderStyle.THIN);
		style.setBorderLeft(BorderStyle.THIN);
		style.setBorderRight(BorderStyle.THIN);
		style.setAlignment(HorizontalAlignment.LEFT);
		style.setWrapText(true);
		return style;
	}

	private CellStyle createCenterStyle(Workbook workbook) {
		CellStyle style = workbook.createCellStyle();
		style.setBorderBottom(BorderStyle.THIN);
		style.setBorderTop(BorderStyle.THIN);
		style.setBorderLeft(BorderStyle.THIN);
		style.setBorderRight(BorderStyle.THIN);
		style.setAlignment(HorizontalAlignment.CENTER);
		style.setWrapText(true);
		return style;
	}

	private CellStyle createNumberStyle(Workbook workbook) {
		CellStyle style = workbook.createCellStyle();
		style.setBorderBottom(BorderStyle.THIN);
		style.setBorderTop(BorderStyle.THIN);
		style.setBorderLeft(BorderStyle.THIN);
		style.setBorderRight(BorderStyle.THIN);
		style.setAlignment(HorizontalAlignment.RIGHT);
		style.setDataFormat(workbook.createDataFormat().getFormat("#,##0.00"));
		return style;
	}

	// Create recipe report sheet
	private void createRecipeReportSheet(Workbook workbook, CellStyle headerStyle, CellStyle boldStyle,
			CellStyle stringStyle, CellStyle centerStyle, CellStyle numberStyle, RecipeMasterDTO recipeMasterDTO) {
		Sheet sheet = workbook.createSheet("Recipe Report");
		int rowNum = 0;
		SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
		DecimalFormat df = new DecimalFormat("##,##,##0.00");
		DecimalFormat dfFour = new DecimalFormat("##,##,##0.0000");

		// Title Row
		Row titleRow = sheet.createRow(rowNum++);
		Cell titleCell = titleRow.createCell(3);
		titleCell.setCellValue("Recipe Management Report");
		titleCell.setCellStyle(boldStyle);

		// Generated Date Row
		Row dateRow = sheet.createRow(rowNum++);
		dateRow.createCell(0).setCellValue("Generated Date:");
		dateRow.getCell(0).setCellStyle(boldStyle);
		dateRow.createCell(1).setCellValue(sdf.format(new Date()));
		dateRow.getCell(1).setCellStyle(stringStyle);

		dateRow.createCell(2).setCellValue("Cost/Portion (AED):");
		dateRow.getCell(2).setCellStyle(boldStyle);
		dateRow.createCell(3).setCellValue(df.format(recipeMasterDTO.getPerPortionCost()));
		dateRow.getCell(3).setCellStyle(stringStyle);

		Row createdRow = sheet.createRow(rowNum++);
		createdRow.createCell(0).setCellValue("Generated By :");
		createdRow.getCell(0).setCellStyle(boldStyle);
		createdRow.createCell(1).setCellValue(username);
		createdRow.getCell(1).setCellStyle(stringStyle);

		createdRow.createCell(2).setCellValue("UOM :");
		createdRow.getCell(2).setCellStyle(boldStyle);
		createdRow.createCell(3).setCellValue(recipeMasterDTO.getUom());
		createdRow.getCell(3).setCellStyle(stringStyle);

		// Summary Rows (Dish Name, Ref No, Total Cost, Cost/Portion)
		Row dishRow = sheet.createRow(rowNum++);
		dishRow.createCell(0).setCellValue("Dish Name:");
		dishRow.getCell(0).setCellStyle(boldStyle);
		dishRow.createCell(1)
				.setCellValue(recipeMasterDTO.getRecipeName() != null ? recipeMasterDTO.getRecipeName() : "");
		dishRow.getCell(1).setCellStyle(stringStyle);

		dishRow.createCell(2).setCellValue("Cuisine  :");
		dishRow.getCell(2).setCellStyle(boldStyle);
		dishRow.createCell(3).setCellValue(recipeMasterDTO.getCuisineName());
		dishRow.getCell(3).setCellStyle(stringStyle);

		Row refRow = sheet.createRow(rowNum++);
		refRow.createCell(0).setCellValue("Ref No:");
		refRow.getCell(0).setCellStyle(boldStyle);
		refRow.createCell(1).setCellValue(recipeMasterDTO.getRefNo() != null ? recipeMasterDTO.getRefNo() : "");
		refRow.getCell(1).setCellStyle(stringStyle);

		refRow.createCell(2).setCellValue("Portion Size  :");
		refRow.getCell(2).setCellStyle(boldStyle);
		refRow.createCell(3).setCellValue(recipeMasterDTO.getPortionSize() + recipeMasterDTO.getUom());
		refRow.getCell(3).setCellStyle(stringStyle);

		Row costRow = sheet.createRow(rowNum++);
		costRow.createCell(0).setCellValue("Total Recipe Cost:");
		costRow.getCell(0).setCellStyle(boldStyle);
		costRow.createCell(1).setCellValue(df.format(recipeMasterDTO.getTotalCost()));
		costRow.getCell(1).setCellStyle(stringStyle);

		costRow.createCell(2).setCellValue("Finished Product  :");
		costRow.getCell(2).setCellStyle(boldStyle);
		costRow.createCell(3).setCellValue(recipeMasterDTO.getFinishedProduct());
		costRow.getCell(3).setCellStyle(stringStyle);

		rowNum++; // Empty row for spacing

		// Header Row
		String[] headers = { "Item Code", "Item Name", "Package ID", "Package Price", "Chef Unit", "Cost Price",
				"Quantity", "Total" };
		Row headerRow = sheet.createRow(rowNum++);
		for (int i = 0; i < headers.length; i++) {
			Cell cell = headerRow.createCell(i);
			cell.setCellValue(headers[i]);
			cell.setCellStyle(headerStyle);
		}

		// Data Rows
		if (recipeMasterDTO.getRecipeSubList() != null) {
			for (RecipeMasterDTO obj : recipeMasterDTO.getRecipeSubList()) {
				Row row = sheet.createRow(rowNum++);

				// Item Code (Column 0)
				row.createCell(0).setCellValue(obj.getItemCode() != null ? obj.getItemCode() : "");
				row.getCell(0).setCellStyle(stringStyle);

				// Item Name (Column 1)
				row.createCell(1).setCellValue(obj.getItemName() != null ? obj.getItemName() : "");
				row.getCell(1).setCellStyle(stringStyle);

				// Package ID (Column 2)
				row.createCell(2).setCellValue(obj.getPackageId() != null ? obj.getPackageId() : "");
				row.getCell(2).setCellStyle(centerStyle);

				// Package Price (Column 3)
				row.createCell(3).setCellValue(dfFour.format(obj.getPackagePrice()));
				row.getCell(3).setCellStyle(numberStyle);

				// Chef Unit (Column 4)
				row.createCell(4).setCellValue(obj.getChefUnit() != null ? obj.getChefUnit() : "");
				row.getCell(4).setCellStyle(stringStyle);

				// Cost Price (Column 5)
				row.createCell(5).setCellValue(df.format(obj.getCostPrice()));
				row.getCell(5).setCellStyle(numberStyle);

				// Quantity (Column 6)
				row.createCell(6).setCellValue(df.format(obj.getQuantity()));
				row.getCell(6).setCellStyle(numberStyle);

				// Total (Column 7)
				row.createCell(7).setCellValue(dfFour.format(obj.getTotal()));
				row.getCell(7).setCellStyle(numberStyle);
			}
		}

		// Auto-size all columns
		for (int i = 0; i < headers.length; i++) {
			sheet.autoSizeColumn(i);
		}
	}

	public ResponseDTO<List<RecipeMealMappingDTO>> recipeAvailableList(RecipeMealMappingDTO recipeMasterListDTO) {
		ResponseDTO<List<RecipeMealMappingDTO>> response = new ResponseDTO<>();
		try {
			List<RecipeMealMappingDTO> recipeMasterList = fetchRecipesByCategoryFilter(
					recipeMasterListDTO.getCategoryFk());
			if (!recipeMasterList.isEmpty()) {
				response.setData(recipeMasterList);
				response.setSuccess(AppConstants.TRUE);
				response.setMessage(AppConstants.MSG_RECORD_FETCHED);
				log.info("Recipe Record fetched Successfully, No of records: {}", recipeMasterList.size());
			} else {
				response.setData(Collections.emptyList());
				response.setSuccess(AppConstants.FALSE);
				response.setMessage(AppConstants.MSG_NO_RECORDS_FOUND);
				log.info("No Recipe Records found.");
			}

		} catch (RestException re) {
			response.setSuccess(AppConstants.FALSE);
			response.setMessage(AppConstants.REST_EXCEPTION);
			log.warn(AppConstants.REST_EXCEPTION + AppConstants.RECIPES, re);
		} catch (Exception e) {
			response.setSuccess(AppConstants.FALSE);
			response.setMessage(AppConstants.EXCEPTION);
			log.error(AppConstants.EXCEPTION + AppConstants.RECIPES, e);
		}
		return response;
	}

	private List<RecipeMealMappingDTO> fetchRecipesByCategoryFilter(Integer categoryFk) {
		categoryFk = normalizeCategoryFk(categoryFk);
		List<RecipeHHib> recipeList = recipeHRepository.filterByCategory(categoryFk);
		List<RecipeMealMappingDTO> recipeMasterList = new ArrayList<>();

		if (recipeList == null || recipeList.isEmpty()) {
			return recipeMasterList;
		}

		for (RecipeHHib hib : recipeList) {
			recipeMasterList.add(createRecipeMealDTO(hib));
		}
		return recipeMasterList;
	}

	private Integer normalizeCategoryFk(Integer categoryFk) {
		return (categoryFk != null && categoryFk == 0) ? null : categoryFk;
	}

	private RecipeMealMappingDTO createRecipeMealDTO(RecipeHHib hib) {
		RecipeMealMappingDTO dto = new RecipeMealMappingDTO();
		dto.setRecipeFk(hib.getId());
		dto.setRecipeName(hib.getRecipeName());
		dto.setImageUrl(hib.getImageUrl());
		setCountryNameForRecipe(dto, hib.getCountryOriginFk());
		dto.setCategoryList(fetchCategoriesForRecipeMeal(hib.getId()));
		return dto;
	}

	private void setCountryNameForRecipe(RecipeMealMappingDTO dto, Integer countryOriginFk) {
		CountryMasterHib countryHib = countryMasterRepository.findOne(countryOriginFk);
		if (countryHib != null) {
			dto.setCountryName(countryHib.getCountryName());
		}
	}

	private List<RecipeMealMappingDTO> fetchCategoriesForRecipeMeal(Integer recipeFk) {
		List<RecipeMealMappingDTO> categoryList = new ArrayList<>();
		List<RecipeCategoryMappingHib> recipeCategoryMappingHib = recipeCategoryMappingRepository
				.findActiveByRecipeFk(recipeFk);

		for (RecipeCategoryMappingHib recipeCategoryHib : recipeCategoryMappingHib) {
			CategoryMasterHib categoryHib = categoryMasterRepository.findById(recipeCategoryHib.getCategoryFk());
			RecipeMealMappingDTO mappingDto = new RecipeMealMappingDTO();
			mappingDto.setCategoryName(categoryHib != null ? categoryHib.getCategoryName() : "");
			categoryList.add(mappingDto);
		}
		return categoryList;
	}

	public ResponseDTO<List<RecipeMealMappingDTO>> mealList(RecipeMealMappingDTO filterDTO) {
		ResponseDTO<List<RecipeMealMappingDTO>> response = new ResponseDTO<>();
		try {
			List<RecipeMealMappingDTO> recipeListDTO = fetchRecipesByMealType(filterDTO.getMealFk());

			if (recipeListDTO == null || recipeListDTO.isEmpty()) {
				response.setSuccess(AppConstants.FALSE);
				response.setMessage("No records found for the given meal type.");
				log.info("No recipe meal mapping records found for mealFk: {}", filterDTO.getMealFk());
			} else {
				response.setData(recipeListDTO);
				response.setSuccess(AppConstants.TRUE);
				response.setMessage(AppConstants.MSG_RECORD_FETCHED);
				log.info("Recipe Meal Details fetched Successfully, No of records: {}", recipeListDTO.size());
			}
		} catch (RestException re) {
			response.setSuccess(AppConstants.FALSE);
			response.setMessage(AppConstants.REST_EXCEPTION);
			log.warn(AppConstants.REST_EXCEPTION + " {}", AppConstants.RECIPE, re);
		} catch (Exception e) {
			response.setSuccess(AppConstants.FALSE);
			response.setMessage(AppConstants.EXCEPTION);
			log.error(AppConstants.EXCEPTION + " {}", AppConstants.RECIPE, e);
		}
		return response;
	}

	private List<RecipeMealMappingDTO> fetchRecipesByMealType(Integer mealTypeFk) {
		Integer normalizedMealFk = normalizeMealTypeFk(mealTypeFk);
		List<RecipeHHib> recipeList = recipeHRepository.filterByMealType(normalizedMealFk);
		if (recipeList == null || recipeList.isEmpty()) {
			return new ArrayList<>();
		}
		return recipeList.stream().map(hib -> createMealMappingDTO(hib, normalizedMealFk)).toList();
	}

	private Integer normalizeMealTypeFk(Integer mealTypeFk) {
		return (mealTypeFk != null && mealTypeFk == 0) ? null : mealTypeFk;
	}

	private RecipeMealMappingDTO createMealMappingDTO(RecipeHHib hib, Integer mealTypeFk) {
		RecipeMealMappingDTO dto = new RecipeMealMappingDTO();
		dto.setRecipeFk(hib.getId());
		dto.setRecipeName(hib.getRecipeName());
		dto.setImageUrl(hib.getImageUrl());
		setCountryNameForRecipe(dto, hib.getCountryOriginFk());
		setMealMappingId(dto, mealTypeFk, hib.getId());
		dto.setCategoryList(fetchCategoriesForRecipeMeal(hib.getId()));
		return dto;
	}

	private void setMealMappingId(RecipeMealMappingDTO dto, Integer mealTypeFk, Integer recipeId) {
		if (mealTypeFk != null) {
			RecipeMealMappingHib mappingHib = recipeMealMappingRepository.findByMealAndRecipeActive(mealTypeFk,
					recipeId);
			if (mappingHib != null) {
				dto.setId(mappingHib.getId());
			}
		}
	}

	public ResponseDTO<RecipeMealMappingDTO> saveRecipeMealMappingMaster(RecipeMealMappingDTO mealMappingDto) {
		ResponseDTO<RecipeMealMappingDTO> response = new ResponseDTO<>();
		try {
			if (mealMappingDto.getMealTypeList() != null && !mealMappingDto.getMealTypeList().isEmpty()) {
				for (RecipeMealMappingDTO dto : mealMappingDto.getMealTypeList()) {
					RecipeMealMappingHib existing = recipeMealMappingRepository
							.findByMealAndRecipeActive(mealMappingDto.getMealFk(), dto.getRecipeFk());
					if (existing != null) {
						existing.setStatus(AppConstants.FLAG_A);
						existing.setUpdateBy(dto.getCreatedBy());
						existing.setUpdatedDate(new Date());
						recipeMealMappingRepository.save(existing);
						break;
					}
					RecipeMealMappingHib hib = new RecipeMealMappingHib();
					hib.setMealFk(mealMappingDto.getMealFk());
					hib.setRecipeFk(dto.getRecipeFk());
					hib.setStatus(AppConstants.FLAG_A);
					hib.setCreatedBy(dto.getCreatedBy());
					hib.setCreatedDate(new Date());
					hib.setUpdateBy(dto.getCreatedBy());
					hib.setUpdatedDate(new Date());
					recipeMealMappingRepository.save(hib);
				}
				response.setSuccess(AppConstants.TRUE);
				response.setMessage("Mapping saved successfully");
			} else {
				response.setSuccess(AppConstants.FALSE);
				response.setMessage(AppConstants.E_DATA);
			}
		} catch (Exception e) {
			log.error(AppConstants.EXCEPTION_SAVING + " Recipe Meal Mapping", e);
			response.setSuccess(AppConstants.FALSE);
			response.setMessage(AppConstants.EXCEPTION_SAVING);
		}
		return response;
	}

	public ResponseDTO<RecipeMealMappingDTO> inactiveTheMealType(RecipeMealMappingDTO mealFk) {
		ResponseDTO<RecipeMealMappingDTO> response = new ResponseDTO<>();
		try {
			RecipeMealMappingHib recipeHib = recipeMealMappingRepository.findById(mealFk.getId());
			if (null != recipeHib) {
				recipeHib.setStatus(AppConstants.FLAG_I);
				recipeHib.setUpdateBy(mealFk.getUpdatedBy());
				recipeHib.setUpdatedDate(new Date());
				recipeMealMappingRepository.save(recipeHib);
				response.setSuccess(AppConstants.TRUE);
				response.setMessage("Removed Successfully");
			} else {
				response.setSuccess(AppConstants.FALSE);
				response.setMessage(AppConstants.E_DATA);
			}
		} catch (DataAccessException dae) {
			log.error(AppConstants.DATA_EXCEPTION_SAVE + " Recipe Meal Mapping", dae);
			response.setSuccess(AppConstants.FALSE);
			response.setMessage(AppConstants.DATA_EXCEPTION_SAVE);
		} catch (RestException re) {
			log.warn(AppConstants.REST_EXCEPTION_SAVE + " Recipe MealMapping Master", re);
			response.setSuccess(AppConstants.FALSE);
			response.setMessage(re.getMessage());
		} catch (Exception e) {
			log.error(AppConstants.EXCEPTION_SAVING + AppConstants.RECIPE_MEAL_MAPPING, e);
			response.setSuccess(AppConstants.FALSE);
			response.setMessage(AppConstants.EXCEPTION_SAVING);
		}
		return response;
	}

	public ResponseDTO<List<CategoryRecipeMappingDTO>> categoryMappedList(CategoryRecipeMappingDTO filterDTO) {
		ResponseDTO<List<CategoryRecipeMappingDTO>> response = new ResponseDTO<>();
		try {
			List<CategoryRecipeMappingDTO> recipeListDTO = fetchRecipesByCategory(filterDTO.getCategoryFk());
			if (!recipeListDTO.isEmpty()) {
				response.setData(recipeListDTO);
				response.setSuccess(AppConstants.TRUE);
				response.setMessage(AppConstants.MSG_RECORD_FETCHED);
				log.info("Recipe MealType Details fetched Successfully, No of records: {}", recipeListDTO.size());
			} else {
				response.setData(Collections.emptyList());
				response.setSuccess(AppConstants.FALSE);
				response.setMessage(AppConstants.MSG_NO_RECORDS_FOUND);
				log.info("No Recipe MealType Details found.");
			}

		} catch (RestException re) {
			response.setSuccess(AppConstants.FALSE);
			response.setMessage(AppConstants.REST_EXCEPTION);
			log.warn(AppConstants.REST_EXCEPTION + " Recipe MealType list", re);
		} catch (Exception e) {
			response.setSuccess(AppConstants.FALSE);
			response.setMessage(AppConstants.EXCEPTION);
			log.error(AppConstants.EXCEPTION + " Recipe MealType list", e);
		}
		return response;
	}

	private List<CategoryRecipeMappingDTO> fetchRecipesByCategory(Integer categoryFk) {
		categoryFk = (categoryFk != null && categoryFk == 0) ? null : categoryFk;
		List<RecipeHHib> recipeList = recipeHRepository.filterByCategorys(categoryFk);
		List<CategoryRecipeMappingDTO> recipeListDTO = new ArrayList<>();

		if (recipeList == null || recipeList.isEmpty()) {
			return recipeListDTO;
		}

		for (RecipeHHib hib : recipeList) {
			recipeListDTO.add(buildCategoryRecipeDTO(hib, categoryFk));
		}
		return recipeListDTO;
	}

	private CategoryRecipeMappingDTO buildCategoryRecipeDTO(RecipeHHib hib, Integer categoryFk) {
		CategoryRecipeMappingDTO dto = new CategoryRecipeMappingDTO();
		dto.setRecipeFk(hib.getId());
		dto.setRecipeName(hib.getRecipeName());
		dto.setImageUrl(hib.getImageUrl());
		populateCountryName(dto, hib.getCountryOriginFk());
		populateMappingId(dto, categoryFk, hib.getId());
		dto.setCategoryList(fetchRecipeCategories(hib.getId()));
		return dto;
	}

	private void populateMappingId(CategoryRecipeMappingDTO dto, Integer categoryFk, Integer recipeId) {
		if (categoryFk != null) {
			RecipeCategoryMappingHib mappingHib = recipeCategoryMappingRepository
					.findByCategoryAndRecipeActive(categoryFk, recipeId);
			if (mappingHib != null) {
				dto.setId(mappingHib.getId());
			}
		}
	}

	private List<CategoryRecipeMappingDTO> fetchRecipeCategories(Integer recipeFk) {
		List<CategoryRecipeMappingDTO> categoryList = new ArrayList<>();
		List<RecipeCategoryMappingHib> recipeCategoryMappingHib = recipeCategoryMappingRepository
				.findActiveByRecipeFk(recipeFk);

		for (RecipeCategoryMappingHib recipeCategoryHib : recipeCategoryMappingHib) {
			CategoryMasterHib categoryHib = categoryMasterRepository.findById(recipeCategoryHib.getCategoryFk());
			CategoryRecipeMappingDTO mappingDto = new CategoryRecipeMappingDTO();
			mappingDto.setCategoryName(categoryHib != null ? categoryHib.getCategoryName() : "");
			categoryList.add(mappingDto);
		}
		return categoryList;
	}

	public ResponseDTO<CategoryRecipeMappingDTO> saveCategoryMapping(CategoryRecipeMappingDTO mealMappingDto) {
		ResponseDTO<CategoryRecipeMappingDTO> response = new ResponseDTO<>();
		try {
			if (mealMappingDto.getCategoryMappingList() != null && !mealMappingDto.getCategoryMappingList().isEmpty()) {
				for (CategoryRecipeMappingDTO dto : mealMappingDto.getCategoryMappingList()) {
					RecipeCategoryMappingHib existing = recipeCategoryMappingRepository
							.findByCategoryAndRecipeActive(mealMappingDto.getCategoryFk(), dto.getRecipeFk());
					if (existing != null) {
						existing.setStatus(AppConstants.FLAG_A);
						existing.setUpdatedBy(dto.getCreatedBy());
						existing.setUpdatedDate(new Date());
						recipeCategoryMappingRepository.save(existing);
						break;
					}
					RecipeCategoryMappingHib hib = new RecipeCategoryMappingHib();
					hib.setCategoryFk(mealMappingDto.getCategoryFk());
					hib.setRecipeFk(dto.getRecipeFk());
					hib.setStatus(AppConstants.FLAG_A);
					hib.setCreatedBy(dto.getCreatedBy());
					hib.setCreatedDate(new Date());
					hib.setUpdatedBy(dto.getCreatedBy());
					hib.setUpdatedDate(new Date());
					recipeCategoryMappingRepository.save(hib);
				}
				response.setSuccess(AppConstants.TRUE);
				response.setMessage("Category mapped successfully");
			} else {
				response.setSuccess(AppConstants.FALSE);
				response.setMessage(AppConstants.E_DATA);
			}
		} catch (DataAccessException dae) {
			log.error(AppConstants.DATA_EXCEPTION_SAVE + " Category Maping", dae);
			response.setSuccess(AppConstants.FALSE);
			response.setMessage(AppConstants.DATA_EXCEPTION_SAVE);
		} catch (RestException re) {
			log.warn(AppConstants.REST_EXCEPTION_SAVE + " Category Mapping", re);
			response.setSuccess(AppConstants.FALSE);
			response.setMessage(re.getMessage());
		} catch (Exception e) {
			log.error(AppConstants.EXCEPTION_SAVING + " Category Mapping", e);
			response.setSuccess(AppConstants.FALSE);
			response.setMessage(AppConstants.EXCEPTION_SAVING);
		}
		return response;
	}

	public ResponseDTO<CategoryRecipeMappingDTO> inactiveTheCategory(CategoryRecipeMappingDTO mealFk) {
		ResponseDTO<CategoryRecipeMappingDTO> response = new ResponseDTO<>();
		try {
			RecipeCategoryMappingHib recipeHib = recipeCategoryMappingRepository.findById(mealFk.getId());
			if (null != recipeHib) {
				recipeHib.setStatus(AppConstants.FLAG_I);
				recipeHib.setUpdatedBy(mealFk.getUpdatedBy());
				recipeHib.setUpdatedDate(new Date());
				recipeCategoryMappingRepository.save(recipeHib);
				response.setSuccess(AppConstants.TRUE);
				response.setMessage("Removed Successfully");
			} else {
				response.setSuccess(AppConstants.FALSE);
				response.setMessage(AppConstants.E_DATA);
			}
		} catch (DataAccessException dae) {
			log.error(AppConstants.DATA_EXCEPTION_SAVE + AppConstants.RECIPE_MEAL_MAPPING, dae);
			response.setSuccess(AppConstants.FALSE);
			response.setMessage(AppConstants.DATA_EXCEPTION_SAVE);
		} catch (RestException re) {
			log.warn(AppConstants.REST_EXCEPTION_SAVE + AppConstants.RECIPE_MEAL_MAPPING, re);
			response.setSuccess(AppConstants.FALSE);
			response.setMessage(re.getMessage());
		} catch (Exception e) {
			log.error(AppConstants.EXCEPTION_SAVING + AppConstants.RECIPE_MEAL_MAPPING, e);
			response.setSuccess(AppConstants.FALSE);
			response.setMessage(AppConstants.EXCEPTION_SAVING);
		}
		return response;
	}

	public ResponseDTO<List<CategoryRecipeMappingDTO>> availableCategoryList(
			CategoryRecipeMappingDTO recipeMasterListDTO) {
		ResponseDTO<List<CategoryRecipeMappingDTO>> response = new ResponseDTO<>();
		try {
			List<CategoryRecipeMappingDTO> recipeMasterList = recipeFetchRecipesByCountry(
					recipeMasterListDTO.getCountryOriginFk());
			if (!recipeMasterList.isEmpty()) {
				response.setData(recipeMasterList);
				response.setSuccess(AppConstants.TRUE);
				response.setMessage(AppConstants.MSG_RECORD_FETCHED);
				log.info("Recipe Details fetched Successfully, No of records: {}", recipeMasterList.size());
			} else {
				response.setData(Collections.emptyList());
				response.setSuccess(AppConstants.FALSE);
				response.setMessage(AppConstants.MSG_NO_RECORDS_FOUND);
				log.info("No Recipe Details found.");
			}

		} catch (RestException re) {
			response.setSuccess(AppConstants.FALSE);
			response.setMessage(AppConstants.REST_EXCEPTION);
			log.warn(AppConstants.REST_EXCEPTION + AppConstants.RECIPES, re);
		} catch (Exception e) {
			response.setSuccess(AppConstants.FALSE);
			response.setMessage(AppConstants.EXCEPTION);
			log.error(AppConstants.EXCEPTION + AppConstants.RECIPES, e);
		}
		return response;
	}

	private List<CategoryRecipeMappingDTO> recipeFetchRecipesByCountry(Integer countryFk) {
		countryFk = (countryFk != null && countryFk == 0) ? null : countryFk;
		List<RecipeHHib> recipeList = recipeHRepository.filterByCountry(countryFk);
		List<CategoryRecipeMappingDTO> recipeMasterList = new ArrayList<>();

		if (recipeList == null || recipeList.isEmpty()) {
			return recipeMasterList;
		}

		for (RecipeHHib hib : recipeList) {
			recipeMasterList.add(recipeBuildRecipeDTO(hib));
		}
		return recipeMasterList;
	}

	private CategoryRecipeMappingDTO recipeBuildRecipeDTO(RecipeHHib hib) {
		CategoryRecipeMappingDTO dto = new CategoryRecipeMappingDTO();
		dto.setRecipeFk(hib.getId());
		dto.setRecipeName(hib.getRecipeName());
		dto.setImageUrl(hib.getImageUrl());
		populateCountryName(dto, hib.getCountryOriginFk());
		dto.setCategoryList(fetchRecipeCategories(hib.getId()));
		return dto;
	}

	private void populateCountryName(CategoryRecipeMappingDTO dto, Integer countryOriginFk) {
		CountryMasterHib countryHib = countryMasterRepository.findOne(countryOriginFk);
		if (countryHib != null) {
			dto.setCountryName(countryHib.getCountryName());
		}
	}

	public ResponseDTO<RecipeMasterDTO> checkCode(RecipeMasterDTO dto) {
		ResponseDTO<RecipeMasterDTO> response = new ResponseDTO<>();

		try {
			if (dto != null) {
				if (recipeHRepository.findCode(dto.getRefNo().trim()) == null) {
					response.setSuccess(AppConstants.TRUE);
				} else {
					response.setSuccess(AppConstants.FALSE);
					response.setMessage(dto.getRefNo() + AppConstants.RefNo);
				}
			} else {
				response.setSuccess(AppConstants.FALSE);
				response.setMessage(AppConstants.E_DATA);
			}
		} catch (RestException re) {
			log.warn(AppConstants.REST_EXCEPTION, re);
			response.setSuccess(AppConstants.FALSE);
			response.setMessage(AppConstants.REST_EXCEPTION);
		} catch (Exception e) {
			log.error(AppConstants.EXCEPTION, e);
			response.setSuccess(AppConstants.FALSE);
			response.setMessage(AppConstants.EXCEPTION);
		}

		return response;
	}

}
