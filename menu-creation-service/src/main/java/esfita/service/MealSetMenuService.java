package esfita.service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

import org.apache.poi.hssf.usermodel.HSSFSheet;
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
import org.apache.poi.ss.usermodel.VerticalAlignment;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.ss.util.CellRangeAddress;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataAccessException;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import esfita.dto.ComboBoxDTO;
import esfita.dto.MealSetMenuDTO;
import esfita.dto.ResponseDTO;
import esfita.entity.MealSetMenuDHib;
import esfita.entity.MealSetMenuHHib;
import esfita.entity.MealSetMenuIHib;
import esfita.entity.MealSetTemplateDHib;
import esfita.entity.MealSetTemplateHHib;
import esfita.entity.MstCategoryMasterHib;
import esfita.entity.MstUserHib;
import esfita.entity.RecipeDHib;
import esfita.entity.RecipeHHib;
import esfita.entity.RecipeMealMasterHib;
import esfita.repository.MealSetMenuDRepository;
import esfita.repository.MealSetMenuHRepository;
import esfita.repository.MealSetMenuIRepository;
import esfita.repository.MealSetTemplateDRepository;
import esfita.repository.MealSetTemplateHRepository;
import esfita.repository.MstCategoryMasterRepository;
import esfita.repository.MstUserRepository;
import esfita.repository.RecipeDRepository;
import esfita.repository.RecipeHRepository;
import esfita.repository.RecipeMealMasterRepository;
import esfita.utils.AppConstants;
import esfita.utils.RestException;
import lombok.extern.log4j.Log4j2;

@Service
@Log4j2
public class MealSetMenuService {

	private static final Logger log = LoggerFactory.getLogger(MealSetMenuService.class);

	public static final String STATUS_DRAFT = "Draft";
	public static final String STATUS_APPROVED = "Approved";
	public static final String STATUS_PENDING = "Pending";
	public static final String STATUS_REJECTED = "Rejected";
	public static final String STATUS_UNKNOWN = "Unknown";
	public static final String NOT_ASSIGNED = "Not Assigned";

	private final MealSetTemplateHRepository mealSetTemplateHRepository;
	private final MealSetTemplateDRepository mealSetTemplateDRepository;
	private final MstUserRepository mstUserRepository;
	private final RecipeMealMasterRepository recipeMealMasterRepository;
	private final MstCategoryMasterRepository mstCategoryMasterRepository;
	private final MealSetMenuDRepository mealSetMenuDRepository;
	private final MealSetMenuHRepository mealSetMenuHRepository;
	private final MealSetMenuIRepository mealSetMenuIRepository;
	private final RecipeHRepository recipeHRepository;
	private final RecipeDRepository recipeDRepository;

	// Constructor injection
	public MealSetMenuService(MealSetTemplateHRepository mealSetTemplateHRepository,
			MealSetTemplateDRepository mealSetTemplateDRepository, MstUserRepository mstUserRepository,
			RecipeMealMasterRepository recipeMealMasterRepository,
			MstCategoryMasterRepository mstCategoryMasterRepository, MealSetMenuDRepository mealSetMenuDRepository,
			MealSetMenuHRepository mealSetMenuHRepository, MealSetMenuIRepository mealSetMenuIRepository,
			RecipeHRepository recipeHRepository, RecipeDRepository recipeDRepository) {
		this.mealSetTemplateHRepository = mealSetTemplateHRepository;
		this.mealSetTemplateDRepository = mealSetTemplateDRepository;
		this.mstUserRepository = mstUserRepository;
		this.recipeMealMasterRepository = recipeMealMasterRepository;
		this.mstCategoryMasterRepository = mstCategoryMasterRepository;
		this.mealSetMenuDRepository = mealSetMenuDRepository;
		this.mealSetMenuHRepository = mealSetMenuHRepository;
		this.mealSetMenuIRepository = mealSetMenuIRepository;
		this.recipeHRepository = recipeHRepository;
		this.recipeDRepository = recipeDRepository;
	}

	public ResponseDTO<MealSetMenuDTO> mealSetMenuList(MealSetMenuDTO mealSetMenuDTO) {
		ResponseDTO<MealSetMenuDTO> response = new ResponseDTO<>();
		try {
			Integer mealTypeFk = mealSetMenuDTO.getMealTypeFk();
			Integer approvalStatus = mealSetMenuDTO.getApprovalStatus();

			List<MealSetMenuHHib> menuList = mealSetMenuHRepository.findByMealTypeAndApprovalStatus(mealTypeFk,
					approvalStatus);
			if (menuList == null || menuList.isEmpty()) {
				return buildEmptyResponse(response);
			}

			List<MealSetMenuDTO> mealSetMenuList = menuList.stream().map(this::mapToMealSetMenuDTO).toList();

			MealSetMenuDTO summaryDTO = buildSummaryDTO(mealSetMenuList);

			mealSetMenuDTO.getCreatedBy();
			if (mealSetMenuDTO.getCreatedBy() != 0) {
				summaryDTO.setApprover(mstUserRepository.findById(mealSetMenuDTO.getCreatedBy())
						.map(MstUserHib::getFirstName).orElse(NOT_ASSIGNED));
			} else {
				summaryDTO.setApprover(NOT_ASSIGNED);
			}
			response.setData(summaryDTO);
			response.setSuccess(AppConstants.TRUE);
			response.setMessage(AppConstants.MSG_RECORD_FETCHED);
			log.info("<---- Meal Set Menu Details fetched Successfully, No of records {}",
			        mealSetMenuList.size());

		} catch (RestException re) {
			log.warn(AppConstants.REST_EXCEPTION + " Meal Set Menu list", re);
			response.setSuccess(AppConstants.FALSE);
		} catch (Exception e) {
			log.error(AppConstants.EXCEPTION + " Meal Set Menu list", e);
			response.setSuccess(AppConstants.FALSE);
		}
		return response;
	}

	private ResponseDTO<MealSetMenuDTO> buildEmptyResponse(ResponseDTO<MealSetMenuDTO> response) {
		response.setSuccess(AppConstants.FALSE);
		response.setMessage(AppConstants.ISEMPTY);
		return response;
	}

	private MealSetMenuDTO mapToMealSetMenuDTO(MealSetMenuHHib hib) {
		MealSetMenuDTO dto = new MealSetMenuDTO();
		dto.setId(hib.getId());
		dto.setMenuName(hib.getMenuName());
		dto.setTemplateName(hib.getTemplateName());
		dto.setMealType(hib.getMealTypeName());
		dto.setTotalRecipes(hib.getRecipeCount());
		dto.setTotalCost(hib.getTotalCost());
		dto.setCreatedDate(hib.getCreatedDateTime());
		if (hib.getCreatedBy() != 0) {
			dto.setUserName(mstUserRepository.findById(hib.getCreatedBy()).map(MstUserHib::getFirstName)
					.orElse(NOT_ASSIGNED));
		} else {
			dto.setUserName(NOT_ASSIGNED);
		}

		dto.setStatus(hib.getStatus());
		dto.setApprovalStatus(hib.getApprovalStatus());
		dto.setStatusStr(hib.getStatus() == AppConstants.FLAG_A ? AppConstants.ACTIVE : AppConstants.INACTIVE);
		dto.setApprovalStatusStr(getApprovalStatusString(hib.getApprovalStatus()));
		dto.setCategoryList(fetchCategoryList(hib.getId()));
		hib.getApprovedBy(); // check if approvedBy is not null
		if (hib.getApprovedBy() != 0) {
			dto.setApprover(mstUserRepository.findById(hib.getApprovedBy()).map(MstUserHib::getFirstName)
					.orElse(NOT_ASSIGNED));
		} else {
			dto.setApprover(NOT_ASSIGNED);
		}
		dto.setCreatedDate(hib.getCreatedDateTime());
		dto.setUpdatedDate(hib.getLastActDateTime());
		return dto;
	}

	public static String getApprovalStatusString(Integer approvalStatus) {
		return switch (approvalStatus) {
		case 3 -> STATUS_DRAFT;
		case 0 -> STATUS_APPROVED;
		case 1 -> STATUS_PENDING;
		case 2 -> STATUS_REJECTED;
		default -> STATUS_UNKNOWN;
		};
	}

	private List<MealSetMenuDTO> fetchCategoryList(int i) {
		List<Object[]> resultList = mealSetMenuDRepository.findCategoryRecipeSummary(i);
		if (resultList == null || resultList.isEmpty())
			return Collections.emptyList();

		return resultList.stream().map(row -> {
			MealSetMenuDTO ddto = new MealSetMenuDTO();
			String categoryName = (String) row[0];
			Long recipeCount = ((Number) row[1]).longValue();
			ddto.setCategoriesName(categoryName + " (" + recipeCount + ")");
			return ddto;
		}).toList();
	}

	private MealSetMenuDTO buildSummaryDTO(List<MealSetMenuDTO> menuList) {
		MealSetMenuDTO summaryDTO = new MealSetMenuDTO();
		summaryDTO.setMealSetMenuList(menuList);

		List<Object[]> resultList = mealSetMenuHRepository.getMenuSummary();
		if (resultList == null || resultList.isEmpty()) {
			summaryDTO.setTotalMenu(0);
			summaryDTO.setActiveMenu(0);
			summaryDTO.setPendingApproval(0);
			summaryDTO.setAverageCost(0.0);
			return summaryDTO;
		}

		Object[] result = resultList.get(0);
		summaryDTO.setTotalMenu(getIntValue(result[0]));
		summaryDTO.setActiveMenu(getIntValue(result[1]));
		summaryDTO.setPendingApproval(getIntValue(result[2]));
		summaryDTO.setAverageCost(getDoubleValue(result[3]));

		return summaryDTO;
	}

	private int getIntValue(Object obj) {
		return (obj instanceof Number num) ? num.intValue() : 0;
	}

	private double getDoubleValue(Object obj) {
		return (obj instanceof Number num) ? num.doubleValue() : 0.0;
	}

	public ResponseDTO<MealSetMenuDTO> mealSetMenuStatusUpdate(MealSetMenuDTO dto) {
		ResponseDTO<MealSetMenuDTO> response = new ResponseDTO<>();
		try {
			if (null != dto && 0 != dto.getId()) {

				Optional<MealSetMenuHHib> hib1 = mealSetMenuHRepository.findById(dto.getId());
				if (hib1.isPresent()) {
					MealSetMenuHHib hib = hib1.get();
					char status = Character.toUpperCase(dto.getStatus());
					if (status == AppConstants.FLAG_A) {
						hib.setStatus(AppConstants.FLAG_A);
						response.setMessage(AppConstants.ACTIVATED);
					} else if (status == AppConstants.FLAG_I) {
						hib.setStatus(AppConstants.FLAG_I);
						response.setMessage(AppConstants.INACTIVATED);
					}
					mealSetMenuHRepository.save(hib);
					response.setSuccess(true);
				} else {
					response.setSuccess(false);
					response.setMessage(AppConstants.ISEMPTY);
				}
			} else {
				response.setSuccess(false);
				response.setMessage(AppConstants.E_DATA);
			}
		} catch (RestException exception) {
			log.warn(AppConstants.REST_EXCEPTION_UPDATE + "MealSet Menu ", exception);
			response.setSuccess(AppConstants.FALSE);
			response.setMessage(AppConstants.REST_EXCEPTION_UPDATE);
		} catch (Exception e) {
			log.error(AppConstants.EXCEPTION_UPDATE + " MealSet Menu", e);
			response.setSuccess(AppConstants.FALSE);
			response.setMessage(AppConstants.EXCEPTION_UPDATE);
		}
		return response;
	}

//	 Meal Set Menu View 

	public ResponseDTO<MealSetMenuDTO> mealSetMenuViewById(int id) {
		ResponseDTO<MealSetMenuDTO> response = new ResponseDTO<>();

		try {
			// Fetch meal set menu with a single query
			Optional<MealSetMenuHHib> hibOpt = mealSetMenuHRepository.findById(id);
			if (hibOpt.isEmpty()) {
				return new ResponseDTO<>(AppConstants.FALSE, "Meal Set Menu not found for ID: " + id, null);
			}

			MealSetMenuHHib hib = hibOpt.get();

			MealSetMenuDTO dto = new MealSetMenuDTO();
			dto.setId(hib.getId());
			dto.setMenuName(hib.getMenuName());
			dto.setMealType(hib.getMealTypeName());
			dto.setTemplateName(hib.getTemplateName());
			dto.setTotalCost(hib.getTotalCost());
			dto.setTotalCategories(hib.getCategoryCount());
			dto.setTotalRecipes(hib.getRecipeCount());

			if (hib.getCreatedBy() != 0) {
				dto.setUserName(mstUserRepository.findById(hib.getCreatedBy()).map(MstUserHib::getFirstName)
						.orElse(NOT_ASSIGNED));
			} else {
				dto.setUserName(NOT_ASSIGNED);
			}

			dto.setCreatedDate(hib.getCreatedDateTime());

			// Set approval status string
			dto.setApprovalStatusStr(switch (hib.getApprovalStatus()) {
			case 0 -> STATUS_APPROVED;
			case 1 -> STATUS_PENDING;
			case 2 -> STATUS_REJECTED;
			case 3 -> STATUS_DRAFT;
			default -> STATUS_UNKNOWN;
			});

			// Fetch approver name in a single optional check
			hib.getApprovedBy(); // check if approvedBy is not null
			if (hib.getApprovedBy() != 0) {
				dto.setApprover(mstUserRepository.findById(hib.getApprovedBy()).map(MstUserHib::getFirstName)
						.orElse(NOT_ASSIGNED));
			} else {
				dto.setApprover(NOT_ASSIGNED);
			}

			// Fetch all categories + recipes in one go
			List<MealSetMenuDHib> catList = mealSetMenuDRepository.findByActCat(hib.getId());
			List<MealSetMenuDTO> categoryList = new ArrayList<>();

			if (catList != null && !catList.isEmpty()) {
				// Group recipes by category FK
				Map<Integer, List<MealSetMenuDHib>> groupedByCategory = catList.stream()
						.collect(Collectors.groupingBy(MealSetMenuDHib::getCategoryFk));

				// Pre-map category DTOs
				groupedByCategory.forEach((categoryFk, recipes) -> {
					MealSetMenuDTO categoryDto = new MealSetMenuDTO();
					categoryDto.setCategoryFk(categoryFk);
					categoryDto.setCategoriesName(recipes.get(0).getCategoryName());

					// Map recipes for this category
					List<MealSetMenuDTO> recipeDtos = recipes.stream().map(hibD -> {
						MealSetMenuDTO recipeDto = new MealSetMenuDTO();
						recipeDto.setRecipeName(hibD.getRecipeName());
						recipeDto.setRecipeCost(hibD.getPerPortionCost());
						recipeDto.setPortionSize(hibD.getPortionSize());
						recipeDto.setUom(hibD.getUom());
						return recipeDto;
					}).toList();

					categoryDto.setRecipes(recipeDtos);
					categoryList.add(categoryDto);
				});
			}

			dto.setCategoryList(categoryList);
			response.setData(dto);
			response.setSuccess(AppConstants.TRUE);
			response.setMessage(AppConstants.MSG_RECORD_FETCHED);
			log.info("Meal Set Menu fetched successfully for ID: {}", id);

		} catch (RestException re) {
			log.warn("Meal Set Menu not found with ID: {}", id, re);
			response.setSuccess(AppConstants.FALSE);
			response.setMessage(AppConstants.REST_EXCEPTION);
		} catch (Exception e) {
			log.error("Error while fetching Meal Set Menu by ID: {}", id, e);
			response.setSuccess(AppConstants.FALSE);
			response.setMessage(AppConstants.EXCEPTION);
		}

		log.info("Meal Set Menu view process completed for ID: {}", id);
		return response;
	}

	public ResponseDTO<MealSetMenuDTO> mealSetMenuApprovalStatus(MealSetMenuDTO dto) {
		ResponseDTO<MealSetMenuDTO> response = new ResponseDTO<>();

		try {
			if (dto != null) {
				Optional<MealSetMenuHHib> existingTemplate1 = mealSetMenuHRepository.findById(dto.getId());

				if (existingTemplate1.isPresent()) {
					MealSetMenuHHib existingTemplate = existingTemplate1.get();

					existingTemplate.setApprovalStatus(dto.getApprovalStatus());
					existingTemplate.setApprovedBy(dto.getApproverBy());

					existingTemplate.setLastActBy(dto.getApproverBy());
					existingTemplate.setLastActDateTime(new Date());

					mealSetMenuHRepository.save(existingTemplate);
					response.setSuccess(AppConstants.TRUE);
					response.setMessage(AppConstants.APPROVAL_STATUS);

				} else {
					response.setSuccess(AppConstants.FALSE);
					response.setMessage(AppConstants.EMPTY);
				}
			} else {
				response.setSuccess(AppConstants.FALSE);
				response.setMessage(AppConstants.E_DATA); // Input data is null
			}

		} catch (DataAccessException dae) {
			log.error(AppConstants.DATA_EXCEPTION_SAVE + " Meal Set Menu ", dae);
			response.setSuccess(AppConstants.FALSE);
			response.setMessage(AppConstants.DATA_EXCEPTION_SAVE);
		} catch (RestException re) {
			log.warn(AppConstants.REST_EXCEPTION_SAVE + " Meal Set Menu", re);
			response.setSuccess(AppConstants.FALSE);
			response.setMessage(re.getMessage());
		} catch (Exception e) {
			log.error(AppConstants.EXCEPTION_SAVING + " Meal Set Menu", e);
			response.setSuccess(AppConstants.FALSE);
			response.setMessage(AppConstants.EXCEPTION_SAVING);
		}

		return response;
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
			List<MstCategoryMasterHib> mSTCATEGORYMASTERHIB = mstCategoryMasterRepository.orderBy();
			if (mSTCATEGORYMASTERHIB != null && !mSTCATEGORYMASTERHIB.isEmpty()) {
				for (MstCategoryMasterHib hib : mSTCATEGORYMASTERHIB) {
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

	public ResponseDTO<List<ComboBoxDTO>> loadMealSetTemplateDropDown(int mealTypeFk) {
		ResponseDTO<List<ComboBoxDTO>> response = new ResponseDTO<>();
		List<ComboBoxDTO> comboList = new ArrayList<>();
		try {
			List<MealSetTemplateHHib> mealMASTERHIB = mealSetTemplateHRepository.findByMealTypeStatus(mealTypeFk);
			if (mealMASTERHIB != null) {
				for (MealSetTemplateHHib hib : mealMASTERHIB) {
					ComboBoxDTO dto = new ComboBoxDTO();
					dto.setPk(hib.getId());
					dto.setName(hib.getTemplateName());

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
			log.warn(AppConstants.REST_EXCEPTION + "Recipe Meal Name", re);
		} catch (Exception e) {
			response.setSuccess(AppConstants.FALSE);
			log.error(AppConstants.EXCEPTION + " Recipe Meal Name", e);
		}
		return response;
	}

	public ResponseDTO<List<MealSetMenuDTO>> categoryListByFk(MealSetMenuDTO mealSetMenuDTO) {
		ResponseDTO<List<MealSetMenuDTO>> response = new ResponseDTO<>();
		List<MealSetMenuDTO> mealSetMenuList = new ArrayList<>();

		try {
			if (mealSetMenuDTO == null) {
				return buildErrorResponse1(response, AppConstants.ISEMPTY);
			}

			Optional<MealSetTemplateHHib> hib1 = mealSetTemplateHRepository.findById(mealSetMenuDTO.getTemplateFk());
			if (hib1.isEmpty()) {
				return buildErrorResponse1(response, "No active templates found for the meal type.");
			}

			MealSetTemplateHHib hib = hib1.get();
			MealSetMenuDTO dto = new MealSetMenuDTO();
			dto.setTemplateFk(hib.getId());
			dto.setTemplateName(hib.getTemplateName());
			dto.setMealTypeFk(hib.getMealTypeFk());
			dto.setMealTypeName(hib.getMealTypeName());

			List<MealSetTemplateDHib> templateDList = mealSetTemplateDRepository.findActiveByTemplateFk(hib.getId());
			if (templateDList == null || templateDList.isEmpty()) {
				return buildErrorResponse1(response, "No category data found for the given meal type and category.");
			}

			// ✅ Collect all category FKs first
			Set<Integer> categoryFks = templateDList.stream().map(MealSetTemplateDHib::getCategoryFk)
					.filter(Objects::nonNull).collect(Collectors.toSet());

			// ✅ Fetch all recipes once per category, not per repeat
			Map<Integer, List<RecipeHHib>> recipeMap = new HashMap<>();
			for (Integer catFk : categoryFks) {
				List<RecipeHHib> recipes = recipeHRepository.filterByCategoryFk(catFk);
				recipeMap.put(catFk, recipes);
			}

			List<MealSetMenuDTO> detailList = new ArrayList<>();

			// ✅ Build the response efficiently
			for (MealSetTemplateDHib d_HIB : templateDList) {
				int repeatCount = d_HIB.getRecipesRequired();
				List<RecipeHHib> recipeMasterList = recipeMap.getOrDefault(d_HIB.getCategoryFk(),
						Collections.emptyList());

				for (int i = 0; i < repeatCount; i++) {
					MealSetMenuDTO detailDTO = new MealSetMenuDTO();
					detailDTO.setCategoryFk(d_HIB.getCategoryFk());
					detailDTO.setCategoryName(d_HIB.getCategoryName());
					detailDTO.setRecipeCount(repeatCount);

					List<MealSetMenuDTO> recipeList = new ArrayList<>();
					for (RecipeHHib type : recipeMasterList) {
						MealSetMenuDTO recipeDTO = new MealSetMenuDTO();
						recipeDTO.setRecipeFk(type.getId());
						recipeDTO.setRecipeName(type.getRecipeName());
						recipeDTO.setPerPortionCost(type.getPerPortionCost());
						recipeDTO.setPortionSize(type.getPortionSize());
						recipeDTO.setUom(type.getUom());
						recipeList.add(recipeDTO);
					}

					detailDTO.setRecipes(recipeList);
					detailList.add(detailDTO);
				}
			}

			dto.setDetailList(detailList);
			mealSetMenuList.add(dto);

			response.setData(mealSetMenuList);
			response.setSuccess(AppConstants.TRUE);
			response.setMessage(AppConstants.MSG_RECORD_FETCHED);
			log.info("Available categories fetched successfully. Total records: {}",
			        mealSetMenuList.size());

		} catch (Exception e) {
			log.error(AppConstants.EXCEPTION + " while fetching available categories", e);
			response.setSuccess(AppConstants.FALSE);
			response.setMessage("Error while fetching data: " + e.getMessage());
		}

		return response;
	}

	// ✅ Helper method for concise error response
	private ResponseDTO<List<MealSetMenuDTO>> buildErrorResponse1(ResponseDTO<List<MealSetMenuDTO>> response,
			String msg) {
		response.setSuccess(AppConstants.FALSE);
		response.setMessage(msg);
		return response;
	}

	public ResponseDTO<List<ComboBoxDTO>> loadRecipeMasterDropDown(int categoryFk) {
		ResponseDTO<List<ComboBoxDTO>> response = new ResponseDTO<>();
		List<ComboBoxDTO> comboList = new ArrayList<>();
		try {

			List<RecipeHHib> recipeMasterHIB = recipeHRepository.filterByCategoryFk(categoryFk);
			if (recipeMasterHIB != null) {
				for (RecipeHHib hib : recipeMasterHIB) {
					ComboBoxDTO dto = new ComboBoxDTO();
					dto.setPk(hib.getId());
					dto.setName(hib.getRecipeName());
					dto.setPerPortionCost(hib.getPerPortionCost());
					dto.setPortionSize(hib.getPortionSize());
					dto.setUom(hib.getUom());
					comboList.add(dto);
				}
			} else {
				response.setSuccess(AppConstants.FALSE);
				response.setMessage(AppConstants.E_DATA);
			}

			response.setData(comboList);
		} catch (RestException re) {
			response.setSuccess(AppConstants.FALSE);
			log.warn(AppConstants.REST_EXCEPTION + "Recipe  Name", re);
		} catch (Exception e) {
			response.setSuccess(AppConstants.FALSE);
			log.error(AppConstants.EXCEPTION + " Recipe  Name", e);
		}
		return response;
	}

	public ResponseDTO<MealSetMenuDTO> saveMealSetMenu(MealSetMenuDTO dto) {
		ResponseDTO<MealSetMenuDTO> response = new ResponseDTO<>();

		try {
			if (dto == null) {
				response.setSuccess(AppConstants.FALSE);
				response.setMessage("Request data is null.");
				return response;
			}

			// === Save Header ===
			MealSetMenuHHib header = new MealSetMenuHHib();
			header.setMealTypeFk(dto.getMealTypeFk());
			Optional<RecipeMealMasterHib> meal1 = recipeMealMasterRepository.findById(dto.getMealTypeFk());
			if (meal1.isPresent()) {
				RecipeMealMasterHib meal = meal1.get();
				header.setMealTypeName(meal.getRecipeMealName());
			}

			header.setTemplateFk(dto.getTemplateFk());
			Optional<MealSetTemplateHHib> template1 = mealSetTemplateHRepository.findById(dto.getTemplateFk());
			if (template1.isPresent()) {
				MealSetTemplateHHib template = template1.get();

				header.setTemplateName(template.getTemplateName());
				header.setActualRecipeCount(template.getNoRecipes());
				header.setActualCategoryCount(template.getNoCategories());
			}
			header.setMenuName((dto.getMenuName()));
			header.setCategoryCount(dto.getCategoryCount());
			header.setRecipeCount(dto.getRecipeCount());
			header.setTotalCost(dto.getTotalCost());
			header.setStatus(AppConstants.FLAG_A);
			header.setApprovalStatus(3);
			header.setApprovedBy(dto.getApproverBy());
			header.setCreatedBy(dto.getApproverBy());
			header.setCreatedDateTime(new Date());
			header.setLastActBy(dto.getApproverBy());
			header.setLastActDateTime(new Date());

			header = mealSetMenuHRepository.save(header); // Save header and get ID

			// === Save Detail Records ===
			if (dto.getDetailList() != null && !dto.getDetailList().isEmpty()) {
				for (MealSetMenuDTO detailDTO : dto.getDetailList()) {
					Optional<RecipeHHib> recipe1 = recipeHRepository.findById(detailDTO.getRecipeFk());

					if (recipe1.isPresent()) {
						RecipeHHib recipe = recipe1.get();
						MealSetMenuDHib detail = new MealSetMenuDHib();
						detail.setMenuFk(header.getId());
						detail.setCategoryFk(detailDTO.getCategoryFk());
						detail.setCategoryName(detailDTO.getCategoryName());
						detail.setRecipeFk(recipe.getId());
						detail.setUniqueNo(recipe.getUniqueNo());
						detail.setRecipeName(recipe.getRecipeName());
						detail.setRefNo(recipe.getRefNo());
						detail.setCookingInstruction(recipe.getCookingInstruction());
						detail.setCountryOriginFk(recipe.getCountryOriginFk());
						detail.setBaseQuantityFk(recipe.getBaseQuantityFk());
						detail.setBaseQuantity(recipe.getBaseQuantity());
						detail.setUom(recipe.getUom());
						detail.setFinishedProduct(recipe.getFinishedProduct());
						detail.setPortionSize(recipe.getPortionSize());
						detail.setImageUrl(recipe.getImageUrl());
						detail.setTotalCost(recipe.getTotalCost());
						detail.setPerPortionCost(recipe.getPerPortionCost());
						detail.setStatus(AppConstants.FLAG_A);
						detail.setCreatedBy(dto.getApproverBy());
						detail.setCreatedDateTime(new Date());
						detail.setLastActBy(dto.getApproverBy());
						detail.setLastActDateTime(new Date());

						MealSetMenuDHib savedDetail = mealSetMenuDRepository.save(detail);

						// === Save Ingredients (Items) for the recipe ===
						List<RecipeDHib> ingredients = recipeDRepository.findByActRecipe(recipe.getId());

						for (RecipeDHib ing : ingredients) {

							if (ing != null) {
								MealSetMenuIHib item = new MealSetMenuIHib();
								item.setMenuFk(header.getId());
								item.setMenuDFk(savedDetail.getId());
								item.setRecipeFk(recipe.getId());
								item.setCategoryFk(ing.getCategoryFk());
								item.setCategoryName(ing.getCategoryName());
								item.setItemFk(ing.getItemFk());
								item.setItemCode(ing.getItemCode());
								item.setItemName(ing.getItemName());
								item.setPackageId(ing.getPackageId());
								item.setPackagePrice(ing.getPackagePrice());
								item.setPackageBaseFactor(ing.getPackageBaseFactor());
								item.setPackageSecondaryFactor(ing.getPackageSecondaryFactor());
								item.setPackageBaseUnit(ing.getPackageBaseUnit());
								item.setPackageSecondaryUnit(ing.getPackageSecondaryUnit());
								item.setPackageSecondaryCost(ing.getPackageSecondaryCost());

								item.setBaseQuantity(ing.getBaseQuantity() / detail.getBaseQuantity());
								item.setSecondaryQuantity(ing.getSecondaryQuantity() / detail.getBaseQuantity());

								item.setTotal(ing.getTotal() / detail.getBaseQuantity());

								item.setStatus(AppConstants.FLAG_A);
								item.setCreatedBy(dto.getApproverBy());
								item.setCreatedDateTime(new Date());
								item.setLastActBy(dto.getApproverBy());
								item.setLastActDateTime(new Date());

								mealSetMenuIRepository.save(item);
							}
						}
					}
				}
			}

			response.setSuccess(AppConstants.TRUE);
			response.setMessage("Meal Set Menu saved successfully.");

		} catch (Exception e) {
			log.error("Error saving Meal Set Menu", e);
			response.setSuccess(AppConstants.FALSE);
			response.setMessage("Failed to save menu set data.");
		}

		return response;
	}

	public ResponseDTO<MealSetMenuDTO> copyMealSetMenu(MealSetMenuDTO originalMenuId) {
		ResponseDTO<MealSetMenuDTO> response = new ResponseDTO<>();

		try {
			// 1. Fetch original header
			Optional<MealSetMenuHHib> originalHeader1 = mealSetMenuHRepository.findById(originalMenuId.getId());
			if (originalHeader1.isEmpty()) {

				response.setSuccess(AppConstants.FALSE);
				response.setMessage(" menu not found.");
				return response;
			}
			MealSetMenuHHib originalHeader = originalHeader1.get();
			// 2. Clone header
			MealSetMenuHHib newHeader = new MealSetMenuHHib();
			newHeader.setMealTypeFk(originalHeader.getMealTypeFk());
			newHeader.setMealTypeName(originalHeader.getMealTypeName());
			newHeader.setTemplateFk(originalHeader.getTemplateFk());
			newHeader.setTemplateName(originalHeader.getTemplateName());
			newHeader.setMenuName(originalMenuId.getNewMenuName());
			newHeader.setCategoryCount(originalHeader.getCategoryCount());
			newHeader.setRecipeCount(originalHeader.getRecipeCount());
			newHeader.setTotalCost(originalHeader.getTotalCost());
			newHeader.setStatus(AppConstants.FLAG_A);
			newHeader.setApprovalStatus(3);
			newHeader.setApprovedBy(originalMenuId.getCreatedBy());
			newHeader.setCreatedBy(originalMenuId.getCreatedBy());
			newHeader.setCreatedDateTime(new Date());
			newHeader.setLastActBy(originalMenuId.getCreatedBy());
			newHeader.setLastActDateTime(new Date());
			newHeader.setActualCategoryCount(originalHeader.getActualCategoryCount());
			newHeader.setActualRecipeCount(originalHeader.getActualRecipeCount());

			newHeader = mealSetMenuHRepository.save(newHeader); // Save new header

			// 3. Get all original details
			List<MealSetMenuDHib> originalDetails = mealSetMenuDRepository.findByActCat(originalMenuId.getId());

			if (originalDetails != null && !originalDetails.isEmpty()) {
				for (MealSetMenuDHib originalDetail : originalDetails) {

					// 4. Clone detail
					MealSetMenuDHib newDetail = new MealSetMenuDHib();
					newDetail.setMenuFk(newHeader.getId());
					newDetail.setCategoryFk(originalDetail.getCategoryFk());
					newDetail.setCategoryName(originalDetail.getCategoryName());
					newDetail.setRecipeFk(originalDetail.getRecipeFk());
					newDetail.setUniqueNo(originalDetail.getUniqueNo());
					newDetail.setRecipeName(originalDetail.getRecipeName());
					newDetail.setRefNo(originalDetail.getRefNo());
					newDetail.setCookingInstruction(originalDetail.getCookingInstruction());
					newDetail.setCountryOriginFk(originalDetail.getCountryOriginFk());
					newDetail.setBaseQuantityFk(originalDetail.getBaseQuantityFk());
					newDetail.setBaseQuantity(originalDetail.getBaseQuantity());
					newDetail.setUom(originalDetail.getUom());
					newDetail.setFinishedProduct(originalDetail.getFinishedProduct());
					newDetail.setPortionSize(originalDetail.getPortionSize());
					newDetail.setImageUrl(originalDetail.getImageUrl());
					newDetail.setTotalCost(originalDetail.getTotalCost());
					newDetail.setPerPortionCost(originalDetail.getPerPortionCost());
					newDetail.setStatus(AppConstants.FLAG_A);
					newDetail.setCreatedBy(originalMenuId.getCreatedBy());
					newDetail.setCreatedDateTime(new Date());
					newDetail.setLastActBy(originalMenuId.getCreatedBy());
					newDetail.setLastActDateTime(new Date());

					newDetail = mealSetMenuDRepository.save(newDetail);

					// 5. Get original ingredients/items
					List<MealSetMenuIHib> originalItems = mealSetMenuIRepository.findByMenuDFk(originalDetail.getId());

					if (originalItems != null && !originalItems.isEmpty()) {
						for (MealSetMenuIHib originalItem : originalItems) {
							// Clone ingredient
							MealSetMenuIHib newItem = new MealSetMenuIHib();
							newItem.setMenuFk(newHeader.getId());
							newItem.setMenuDFk(newDetail.getId());
							newItem.setRecipeFk(originalItem.getRecipeFk());
							newItem.setCategoryFk(originalItem.getCategoryFk());
							newItem.setCategoryName(originalItem.getCategoryName());
							newItem.setItemFk(originalItem.getItemFk());
							newItem.setItemCode(originalItem.getItemCode());
							newItem.setItemName(originalItem.getItemName());
							newItem.setPackageId(originalItem.getPackageId());
							newItem.setPackagePrice(originalItem.getPackagePrice());
							newItem.setPackageBaseFactor(originalItem.getPackageBaseFactor());
							newItem.setPackageSecondaryFactor(originalItem.getPackageSecondaryFactor());
							newItem.setPackageBaseUnit(originalItem.getPackageBaseUnit());
							newItem.setPackageSecondaryUnit(originalItem.getPackageSecondaryUnit());
							newItem.setPackageSecondaryCost(originalItem.getPackageSecondaryCost());
							newItem.setBaseQuantity(originalItem.getBaseQuantity());
							newItem.setSecondaryQuantity(originalItem.getSecondaryQuantity());
							newItem.setTotal(originalItem.getTotal());
							newItem.setStatus(AppConstants.FLAG_A);
							newItem.setCreatedBy(originalMenuId.getCreatedBy());
							newItem.setCreatedDateTime(new Date());
							newItem.setLastActBy(originalMenuId.getCreatedBy());
							newItem.setLastActDateTime(new Date());

							mealSetMenuIRepository.save(newItem);
						}
					}
				}
			}

			response.setSuccess(AppConstants.TRUE);
			response.setMessage(AppConstants.MSG_RECORD_COPY);
			// You may implement convertToDTO if needed

		} catch (RestException re) {
			log.warn(AppConstants.REST_EXCEPTION + " Menu not found with ID: {}", re);
			response.setSuccess(AppConstants.FALSE);
			response.setMessage(AppConstants.REST_EXCEPTION);
		} catch (Exception e) {
			response.setSuccess(AppConstants.FALSE);
			response.setMessage(AppConstants.EXCEPTION);
			log.error(AppConstants.EXCEPTION + " not get saved", e);
		}

		return response;
	}

	public ResponseDTO<MealSetMenuDTO> mealSetMenuEditById(int id) {
		ResponseDTO<MealSetMenuDTO> response = new ResponseDTO<>();

		try {
			Optional<MealSetMenuHHib> hibOpt = mealSetMenuHRepository.findById(id);
			if (hibOpt.isEmpty()) {
				return new ResponseDTO<>(AppConstants.FALSE, "Meal set menu not found for ID: " + id, null);
			}

			MealSetMenuHHib hib = hibOpt.get();
			MealSetMenuDTO dto = new MealSetMenuDTO();
			dto.setId(hib.getId());
			dto.setMealTypeFk(hib.getMealTypeFk());
			dto.setTemplateFk(hib.getTemplateFk());
			dto.setMenuName(hib.getMenuName());
			dto.setTotalCost(hib.getTotalCost());

			// Step 1: Fetch selected recipes once and group by category
			List<MealSetMenuDHib> selectedRecipes = mealSetMenuDRepository.findActiveByMenuFk(hib.getId());
			Map<Integer, List<MealSetMenuDHib>> selectedByCategory = selectedRecipes.stream()
					.collect(Collectors.groupingBy(MealSetMenuDHib::getCategoryFk));

			// Step 2: Fetch template details once
			Optional<MealSetTemplateHHib> templateHibOpt = mealSetTemplateHRepository.findById(hib.getTemplateFk());
			if (templateHibOpt.isEmpty()) {
				return new ResponseDTO<>(AppConstants.FALSE, "Template not found for ID: " + hib.getTemplateFk(), null);
			}
			List<MealSetTemplateDHib> templateDetails = mealSetTemplateDRepository
					.findActiveByTemplateFk(templateHibOpt.get().getId());

			// Step 3: Collect all category FKs to fetch recipes per category
			List<Integer> categoryFks = templateDetails.stream().map(MealSetTemplateDHib::getCategoryFk).distinct()
					.toList();

			// Step 4: Fetch recipes per category and store in a map
			Map<Integer, List<RecipeHHib>> recipeMap = new HashMap<>();
			for (Integer catFk : categoryFks) {
				List<RecipeHHib> recipes = recipeHRepository.filterByCategoryFk(catFk);
				recipeMap.put(catFk, recipes);
			}

			// Step 5: Build detail list
			List<MealSetMenuDTO> detailList = new ArrayList<>();
			for (MealSetTemplateDHib templateD : templateDetails) {
				int repeatCount = templateD.getRecipesRequired();
				List<MealSetMenuDHib> selectedForCategory = selectedByCategory.getOrDefault(templateD.getCategoryFk(),
						Collections.emptyList());
				List<RecipeHHib> recipeMasterList = recipeMap.getOrDefault(templateD.getCategoryFk(),
						Collections.emptyList());

				// Map recipes to DTO for dropdown
				List<MealSetMenuDTO> availableRecipes = recipeMasterList.stream().map(r -> {
					MealSetMenuDTO rdto = new MealSetMenuDTO();
					rdto.setRecipeFk(r.getId());
					rdto.setRecipeName(r.getRecipeName());
					rdto.setPerPortionCost(r.getPerPortionCost());
					rdto.setPortionSize(r.getPortionSize());
					rdto.setUom(r.getUom());
					return rdto;
				}).toList();

				for (int i = 0; i < repeatCount; i++) {
					MealSetMenuDTO detailDTO = new MealSetMenuDTO();
					detailDTO.setCategoryFk(templateD.getCategoryFk());
					detailDTO.setCategoryName(templateD.getCategoryName());
					detailDTO.setRecipeCount(repeatCount);
					detailDTO.setRecipes(availableRecipes);

					if (i < selectedForCategory.size()) {
						MealSetMenuDHib selected = selectedForCategory.get(i);
						detailDTO.setRecipeFk(selected.getRecipeFk());
						detailDTO.setPerPortionCost(selected.getPerPortionCost());
						detailDTO.setPortionSize(selected.getPortionSize());
						detailDTO.setUom(selected.getUom());
					}

					detailList.add(detailDTO);
				}
			}

			dto.setDetailList(detailList);
			response.setData(dto);
			response.setSuccess(AppConstants.TRUE);
			response.setMessage(AppConstants.MSG_RECORD_FETCHED);

			log.info("Meal set menu details fetched successfully for ID: {}", id);

		} catch (Exception e) {
			log.error("Error while fetching meal set menu by ID: {}", id, e);
			response.setSuccess(AppConstants.FALSE);
			response.setMessage("Unexpected error occurred while fetching meal set menu.");
		}

		return response;
	}

	public ResponseDTO<MealSetMenuDTO> mealSetMenuEditByIdOld(int id) {
		ResponseDTO<MealSetMenuDTO> response = new ResponseDTO<>();

		try {
			Optional<MealSetMenuHHib> hib1 = mealSetMenuHRepository.findById(id);

			if (hib1.isPresent()) {
				MealSetMenuHHib hib = hib1.get();
				MealSetMenuDTO dto = new MealSetMenuDTO();
				dto.setId(hib.getId());
				dto.setMealTypeFk(hib.getMealTypeFk());
				dto.setTemplateFk(hib.getTemplateFk());
				dto.setMenuName(hib.getMenuName());
				dto.setTotalCost(hib.getTotalCost());

				// Step 1: Fetch already selected recipes for this menu
				List<MealSetMenuDHib> selectedRecipes = mealSetMenuDRepository.findActiveByMenuFk(hib.getId());

				// Step 2: Fetch template to get full category + repeatCount slots
				Optional<MealSetTemplateHHib> templateHib1 = mealSetTemplateHRepository.findById(hib.getTemplateFk());

				List<MealSetMenuDTO> detailList = new ArrayList<>();
				List<MealSetMenuDTO> categoryRecipes = new ArrayList<>();

				if (templateHib1.isPresent()) {
					MealSetTemplateHHib templateHib = templateHib1.get();
					List<MealSetTemplateDHib> templateDetails = mealSetTemplateDRepository
							.findActiveByTemplateFk(templateHib.getId());

					for (MealSetTemplateDHib templateD : templateDetails) {
						int repeatCount = templateD.getRecipesRequired();

						// Get already selected recipes for this category
						List<MealSetMenuDHib> selectedForCategory = selectedRecipes.stream()
								.filter(sr -> sr.getCategoryFk() == templateD.getCategoryFk()).toList();
						for (int i = 0; i < repeatCount; i++) {
							MealSetMenuDTO detailDTO = new MealSetMenuDTO();
							detailDTO.setCategoryFk(templateD.getCategoryFk());
							detailDTO.setCategoryName(templateD.getCategoryName());

							detailDTO.setRecipeCount(repeatCount);
							List<RecipeHHib> recipeMasterList = recipeHRepository
									.filterByCategoryFk(templateD.getCategoryFk());
							for (RecipeHHib type : recipeMasterList) {
								MealSetMenuDTO rdto = new MealSetMenuDTO();
								rdto.setRecipeFk(type.getId());
								rdto.setRecipeName(type.getRecipeName());
								rdto.setPerPortionCost(type.getPerPortionCost());
								rdto.setPortionSize(type.getPortionSize());
								rdto.setUom(type.getUom());
								categoryRecipes.add(rdto);
							}
							detailDTO.setRecipes(categoryRecipes);

							if (i < selectedForCategory.size()) {
								// Fill with already selected recipe
								MealSetMenuDHib selected = selectedForCategory.get(i);
								detailDTO.setRecipeFk(selected.getRecipeFk());
								detailDTO.setPerPortionCost(selected.getPerPortionCost());
								detailDTO.setPortionSize(selected.getPortionSize());
								detailDTO.setUom(selected.getUom());

							}
							detailList.add(detailDTO);
						}
					}
				}

				dto.setDetailList(detailList);
				response.setData(dto);
				response.setSuccess(AppConstants.TRUE);
				response.setMessage(AppConstants.MSG_RECORD_FETCHED);

				log.info("<---- Meal set menu details fetched successfully for ID: {} ---->", id);


			} else {
				response.setSuccess(AppConstants.FALSE);
				response.setMessage(AppConstants.EMPTY + "meal set menu not found for ID: " + id);
				log.info("meal set menu not found for ID:{} ", id);
			}

		} catch (RestException re) {
			log.warn(AppConstants.REST_EXCEPTION + " meal set menu not found with ID: {}", id, re);
			response.setSuccess(AppConstants.FALSE);
			response.setMessage(AppConstants.REST_EXCEPTION);
		} catch (Exception e) {
			response.setSuccess(AppConstants.FALSE);
			response.setMessage(AppConstants.EXCEPTION);
			log.error(AppConstants.EXCEPTION + " meal set menu fetch by ID", e);
		}
		log.info("meal set menu view process completed for ID: {}", id);
		return response;
	}

	public ResponseDTO<MealSetMenuDTO> mealSetMenuModify(MealSetMenuDTO dto) {
		ResponseDTO<MealSetMenuDTO> response = new ResponseDTO<>();

		try {
			if (dto == null) {
				return buildErrorResponse(response, "Request data is null.");
			}

			MealSetMenuHHib header = getOrCreateHeader(dto);
			mealSetMenuHRepository.save(header);

			List<MealSetMenuDHib> existingDetails = mealSetMenuDRepository.findByMenuFk(header.getId());
			Set<String> incomingKeys = dto.getDetailList().stream().map(d -> d.getRecipeFk() + "-" + d.getCategoryFk())
					.collect(Collectors.toSet());

			inactivateRemovedDetails(existingDetails, incomingKeys, dto);

			for (MealSetMenuDTO detailDTO : dto.getDetailList()) {
				Optional<MealSetMenuDHib> matchedDetailOpt = existingDetails.stream()
						.filter(d -> d.getRecipeFk() == detailDTO.getRecipeFk()
								&& d.getCategoryFk() == detailDTO.getCategoryFk())
						.findFirst();

				if (matchedDetailOpt.isPresent()) {
					MealSetMenuDHib detail = matchedDetailOpt.get();
					if (AppConstants.FLAG_A == detail.getStatus()) {
						// skip reactivation if already active
						continue; // ← only one continue remains
					}
					reactivateDetailAndItems(detail, dto);
				} else {
					createNewDetailAndItems(detailDTO, header, dto);
				}
			}

			response.setSuccess(AppConstants.TRUE);
			response.setMessage(dto.getMenuName() + " " + AppConstants.MSG_RECORD_UPDATED);

		} catch (Exception e) {
			log.error("Error saving Menu Set Header and Details", e);
			response.setSuccess(AppConstants.FALSE);
			response.setMessage("Failed to save menu set data.");
		}

		return response;
	}

	private ResponseDTO<MealSetMenuDTO> buildErrorResponse(ResponseDTO<MealSetMenuDTO> response, String message) {
		response.setSuccess(AppConstants.FALSE);
		response.setMessage(message);
		return response;
	}

	private MealSetMenuHHib getOrCreateHeader(MealSetMenuDTO dto) {
		MealSetMenuHHib header = mealSetMenuHRepository.findById(dto.getId()).orElse(new MealSetMenuHHib());
		header.setMenuName(dto.getMenuName());
		header.setCategoryCount(dto.getCategoryCount());
		header.setRecipeCount(dto.getRecipeCount());
		header.setTotalCost(dto.getTotalCost());
		header.setLastActBy(dto.getApproverBy());
		header.setLastActDateTime(new Date());
		return header;
	}

	private void inactivateRemovedDetails(List<MealSetMenuDHib> existingDetails, Set<String> incomingKeys,
			MealSetMenuDTO dto) {
		for (MealSetMenuDHib existing : existingDetails) {
			String key = existing.getRecipeFk() + "-" + existing.getCategoryFk();
			if (!incomingKeys.contains(key) && AppConstants.FLAG_A == existing.getStatus()) {
				existing.setStatus(AppConstants.FLAG_I);
				existing.setLastActBy(dto.getApproverBy());
				existing.setLastActDateTime(new Date());
				mealSetMenuDRepository.save(existing);

				List<MealSetMenuIHib> items = mealSetMenuIRepository.findByMenuDFk(existing.getId());
				for (MealSetMenuIHib item : items) {
					item.setStatus(AppConstants.FLAG_I);
					item.setLastActBy(dto.getApproverBy());
					item.setLastActDateTime(new Date());
					mealSetMenuIRepository.save(item);
				}
			}
		}
	}

	private void reactivateDetailAndItems(MealSetMenuDHib detail, MealSetMenuDTO dto) {
		detail.setStatus(AppConstants.FLAG_A);
		detail.setLastActBy(dto.getApproverBy());
		detail.setLastActDateTime(new Date());
		mealSetMenuDRepository.save(detail);

		List<MealSetMenuIHib> items = mealSetMenuIRepository.findByMenuDFk(detail.getId());
		for (MealSetMenuIHib item : items) {
			item.setStatus(AppConstants.FLAG_A);
			item.setLastActBy(dto.getApproverBy());
			item.setLastActDateTime(new Date());
			mealSetMenuIRepository.save(item);
		}
	}

	private void createNewDetailAndItems(MealSetMenuDTO detailDTO, MealSetMenuHHib header, MealSetMenuDTO dto) {
		Optional<RecipeHHib> recipeOpt = recipeHRepository.findById(detailDTO.getRecipeFk());
		if (recipeOpt.isEmpty())
			return;

		RecipeHHib recipe = recipeOpt.get();
		MealSetMenuDHib detail = buildNewDetail(detailDTO, header, recipe, dto);
		mealSetMenuDRepository.save(detail);

		List<RecipeDHib> ingredients = recipeDRepository.findByActRecipe(recipe.getId());
		for (RecipeDHib ing : ingredients) {
			MealSetMenuIHib item = buildMenuItem(ing, header, detail, detailDTO, dto);
			mealSetMenuIRepository.save(item);
		}
	}

	private MealSetMenuDHib buildNewDetail(MealSetMenuDTO detailDTO, MealSetMenuHHib header, RecipeHHib recipe,
			MealSetMenuDTO dto) {
		MealSetMenuDHib detail = new MealSetMenuDHib();
		detail.setMenuFk(header.getId());
		detail.setCategoryFk(detailDTO.getCategoryFk());
		detail.setCategoryName(detailDTO.getCategoryName());
		detail.setRecipeFk(recipe.getId());
		detail.setUniqueNo(recipe.getUniqueNo());
		detail.setRecipeName(recipe.getRecipeName());
		detail.setRefNo(recipe.getRefNo());
		detail.setCookingInstruction(recipe.getCookingInstruction());
		detail.setCountryOriginFk(recipe.getCountryOriginFk());
		detail.setBaseQuantityFk(recipe.getBaseQuantityFk());
		detail.setBaseQuantity(recipe.getBaseQuantity());
		detail.setUom(recipe.getUom());
		detail.setFinishedProduct(recipe.getFinishedProduct());
		detail.setPortionSize(recipe.getPortionSize());
		detail.setImageUrl(recipe.getImageUrl());
		detail.setTotalCost(recipe.getTotalCost());
		detail.setPerPortionCost(recipe.getPerPortionCost());
		detail.setStatus(AppConstants.FLAG_A);
		detail.setCreatedBy(dto.getApproverBy());
		detail.setCreatedDateTime(new Date());
		detail.setLastActBy(dto.getApproverBy());
		detail.setLastActDateTime(new Date());
		return detail;
	}

	private MealSetMenuIHib buildMenuItem(RecipeDHib ing, MealSetMenuHHib header, MealSetMenuDHib detail,
			MealSetMenuDTO detailDTO, MealSetMenuDTO dto) {
		MealSetMenuIHib item = new MealSetMenuIHib();
		item.setMenuFk(header.getId());
		item.setMenuDFk(detail.getId());
		item.setRecipeFk(detail.getRecipeFk());
		item.setCategoryFk(detailDTO.getCategoryFk());
		item.setCategoryName(detailDTO.getCategoryName());
		item.setItemFk(ing.getId());
		item.setItemCode(ing.getItemCode());
		item.setItemName(ing.getItemName());
		item.setPackageId(ing.getPackageId());
		item.setPackagePrice(ing.getPackagePrice());
		item.setPackageBaseFactor(ing.getPackageBaseFactor());
		item.setPackageSecondaryFactor(ing.getPackageSecondaryFactor());
		item.setPackageBaseUnit(ing.getPackageBaseUnit());
		item.setPackageSecondaryUnit(ing.getPackageSecondaryUnit());
		item.setPackageSecondaryCost(ing.getPackageSecondaryCost());
		item.setBaseQuantity(ing.getBaseQuantity() / detail.getBaseQuantity());
		item.setSecondaryQuantity(ing.getSecondaryQuantity() / detail.getBaseQuantity());
		item.setTotal(ing.getTotal() / detail.getBaseQuantity());
		item.setStatus(AppConstants.FLAG_A);
		item.setCreatedBy(dto.getApproverBy());
		item.setCreatedDateTime(new Date());
		item.setLastActBy(dto.getApproverBy());
		item.setLastActDateTime(new Date());
		return item;
	}

	// :List Excel
	public ResponseEntity<byte[]> exportMealSetMenuExcel(MealSetMenuDTO filterDTO) {
		try {
			ResponseDTO<MealSetMenuDTO> response = mealSetMenuList(filterDTO);
			MealSetMenuDTO summaryDTO = response.getData();

			// Return empty Excel if no records
			if (summaryDTO == null || summaryDTO.getMealSetMenuList() == null
					|| summaryDTO.getMealSetMenuList().isEmpty()) {
				return createEmptyExcelResponse("Meal Set Menu Report",
						"No Meal Set Menus found for the given criteria");
			}

			try (Workbook workbook = new HSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {

				// Create reusable cell styles
				CellStyle headerStyle = createHeaderStyle(workbook);
				CellStyle boldStyle = createBoldStyle(workbook);
				CellStyle stringStyle = createStringStyle(workbook);
				CellStyle centerStyle = createCenterStyle(workbook);
				// Create Excel Sheet
				createMealSetMenuSheet(workbook, summaryDTO, headerStyle, boldStyle, stringStyle, centerStyle);

				workbook.write(out);
				byte[] excelBytes = out.toByteArray();

				return createSuccessResponse(excelBytes, "MealSetMenuReport");
			}

		} catch (Exception e) {
			 log.error("Failed to generate Export MealSetMenu Excel Report", e);
			return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	// ======================
	// Sheet Creation - Meal Set Menu
	// ======================
	private void createMealSetMenuSheet(Workbook workbook, MealSetMenuDTO summaryDTO, CellStyle headerStyle,
			CellStyle boldStyle, CellStyle stringStyle, CellStyle centerStyle) {

		SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
		Sheet sheet = workbook.createSheet("Meal Set Menus");
		int rowNum = 0;

		// Title Row
		Row titleRow = sheet.createRow(rowNum++);
		Cell titleCell = titleRow.createCell(2);
		titleCell.setCellValue("MealSet Menu Report");
		titleCell.setCellStyle(boldStyle);

		// Generated Date Row
		Row dateRow = sheet.createRow(rowNum++);
		dateRow.createCell(0).setCellValue("Generated Date:");
		dateRow.getCell(0).setCellStyle(boldStyle);
		dateRow.createCell(1).setCellValue(sdf.format(new Date()));
		dateRow.getCell(1).setCellStyle(stringStyle);

		Row userRow = sheet.createRow(rowNum++);
		userRow.createCell(0).setCellValue("Generated By : ");
		userRow.getCell(0).setCellStyle(boldStyle);
		userRow.createCell(1).setCellValue(summaryDTO.getApprover());
		userRow.getCell(1).setCellStyle(stringStyle);

		Row totalRow = sheet.createRow(rowNum++);
		totalRow.createCell(0).setCellValue("Total Menu: ");
		totalRow.getCell(0).setCellStyle(boldStyle);
		totalRow.createCell(1).setCellValue(summaryDTO.getTotalMenu());
		totalRow.getCell(1).setCellStyle(stringStyle);

		Row activeRow = sheet.createRow(rowNum++);
		activeRow.createCell(0).setCellValue("Active Menu :");
		activeRow.getCell(0).setCellStyle(boldStyle);
		activeRow.createCell(1).setCellValue(summaryDTO.getActiveMenu());
		activeRow.getCell(1).setCellStyle(stringStyle);

		Row inActiveRow = sheet.createRow(rowNum++);
		inActiveRow.createCell(0).setCellValue("In-Active Menu :");
		inActiveRow.getCell(0).setCellStyle(boldStyle);
		inActiveRow.createCell(1).setCellValue((summaryDTO.getTotalMenu() - summaryDTO.getActiveMenu()));

		inActiveRow.getCell(1).setCellStyle(stringStyle);

		rowNum++; // spacing row

		// Header Row
		String[] headers = { "S.No", "Menu Id", "Template Name", "Menu Name", "Meal Type", "Total Recipes",
				"Approval Status", "Created By", "Approver", "Created Date", "Updated Date", "Status" };

		Row headerRow = sheet.createRow(rowNum++);
		for (int i = 0; i < headers.length; i++) {
			Cell cell = headerRow.createCell(i);
			cell.setCellValue(headers[i]);
			cell.setCellStyle(headerStyle);
		}

		// Data Rows
		int serial = 1;
		for (MealSetMenuDTO obj : summaryDTO.getMealSetMenuList()) {
			Row row = sheet.createRow(rowNum++);
			int col = 0;

			// Safe cell creation helper
			createCell(row, col++, serial++, centerStyle);
			createCell(row, col++, obj.getId(), stringStyle);
			createCell(row, col++, obj.getTemplateName(), stringStyle);
			createCell(row, col++, obj.getMenuName(), stringStyle);
			createCell(row, col++, obj.getMealType(), stringStyle);
			createCell(row, col++, obj.getTotalRecipes(), centerStyle);
			createCell(row, col++, obj.getApprovalStatusStr(), stringStyle);
			createCell(row, col++, obj.getUserName(), stringStyle);
			createCell(row, col++, obj.getApprover(), stringStyle);
			createCell(row, col++, sdf.format(obj.getCreatedDate()), stringStyle);
			createCell(row, col++, sdf.format(obj.getUpdatedDate()), stringStyle);
			createCell(row, col, obj.getStatusStr(), stringStyle);

		}

		// Auto-size all columns
		for (int i = 0; i < headers.length; i++) {
			sheet.autoSizeColumn(i);
		}
	}

	// ======================
	// Helper to safely create cells
	// ======================
	private void createCell(Row row, int colIndex, Object value, CellStyle style) {
		Cell cell = row.createCell(colIndex);
		if (value instanceof Number num) {
			cell.setCellValue(num.doubleValue());
		} else if (value != null) {
			cell.setCellValue(value.toString());
		} else {
			cell.setCellValue("");
		}
		cell.setCellStyle(style);
	}

	// ======================
	// Empty Excel
	// ======================
	private ResponseEntity<byte[]> createEmptyExcelResponse(String sheetTitle, String message) throws IOException {
		try (Workbook workbook = new HSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
			Sheet sheet = workbook.createSheet(sheetTitle);
			Row row = sheet.createRow(0);
			createCell(row, 0, message, null);
			sheet.autoSizeColumn(0);
			workbook.write(out);
			return createSuccessResponse(out.toByteArray(), sheetTitle);
		}
	}

	// ======================
	// Success Response
	// ======================
	private ResponseEntity<byte[]> createSuccessResponse(byte[] excelBytes, String reportName) {
		HttpHeaders headers = new HttpHeaders();
		headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
		headers.setContentDispositionFormData("attachment",
				reportName + "_" + new SimpleDateFormat("yyyyMMddHHmmss").format(new Date()) + ".xls");
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

	// View Download
	String userName = null;

	// Export single Meal Set Menu as Excel
	public ResponseEntity<byte[]> exportSingleMealSetMenuExcel(int menuId, int userId) {
		try {
			ResponseDTO<MealSetMenuDTO> response = mealSetMenuViewById(menuId);
			MealSetMenuDTO mealSetMenuDTO = response.getData();

			
			if (userId != 0) {
				userName = mstUserRepository.findById(userId).map(MstUserHib::getFirstName).orElse(NOT_ASSIGNED);
			} else {
				userName = NOT_ASSIGNED;
			}
			if (mealSetMenuDTO == null || mealSetMenuDTO.getCategoryList() == null
					|| mealSetMenuDTO.getCategoryList().isEmpty()) {
				return createEmptyExcelResponse("Meal Set Menu  Report", "No data available for this menu");
			}

			try (HSSFWorkbook workbook = new HSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {

				// Create all required cell styles
				CellStyle titleStyle = createTitleStyle(workbook);
				CellStyle headerStyle = createHeaderStyle(workbook);
				createBoldStyle(workbook);
				CellStyle strStyle = createStringStyle(workbook);
				CellStyle centerStyle = createCenterStyle(workbook);
				CellStyle numberStyle = createNumberStyle(workbook);

				// Create sheet
				HSSFSheet sheet = workbook.createSheet(mealSetMenuDTO.getMenuName());

				int rowNum = 0;

				// Title row
				Row row = sheet.createRow(rowNum++);
				Cell cell = row.createCell(0);
				cell.setCellValue(mealSetMenuDTO.getMenuName());
				cell.setCellStyle(titleStyle);
				sheet.addMergedRegion(new CellRangeAddress(0, 0, 0, 4));

				sheet.createRow(rowNum++); // empty row

				// Summary Rows (Meal Type, Template, Total Cost, Approval Status, Total
				// Categories, Approver, Menu ID)
				rowNum = createMealSetSummaryRows(sheet, mealSetMenuDTO, rowNum, titleStyle);

				sheet.createRow(rowNum++); // empty row

				// Selected Recipes Header
				row = sheet.createRow(rowNum++);
				cell = row.createCell(0);
				cell.setCellValue("Selected Recipes");
				cell.setCellStyle(titleStyle);
				sheet.addMergedRegion(new CellRangeAddress(rowNum - 1, rowNum - 1, 0, 4));

				sheet.createRow(rowNum++); // empty row

				// Recipes Table Header
				row = sheet.createRow(rowNum++);
				String[] headers = { "Sr. No", "Category", "Recipe", "Ideal Portion", "Cost/Portion" };
				int[] colWidths = { 3000, 9000, 12000, 6000, 6000 };
				for (int i = 0; i < headers.length; i++) {
					cell = row.createCell(i);
					cell.setCellValue(headers[i]);
					cell.setCellStyle(headerStyle);
					sheet.setColumnWidth(i, colWidths[i]);
				}

				// Recipes Data
				int serialNo = 1;
				for (MealSetMenuDTO category : mealSetMenuDTO.getCategoryList()) {
					if (category.getRecipes() != null) {
						for (MealSetMenuDTO recipe : category.getRecipes()) {
							row = sheet.createRow(rowNum++);

							createCell(row, 0, serialNo++, centerStyle);
							createCell(row, 1, category.getCategoriesName(), strStyle);
							createCell(row, 2, recipe.getRecipeName(), strStyle);
							createCell(row, 3,
									recipe.getPortionSize() + " " + (recipe.getUom() != null ? recipe.getUom() : ""),
									strStyle);
							createCell(row, 4, recipe.getRecipeCost(), numberStyle);
						}
					}
				}

				workbook.write(out);
				byte[] excelBytes = out.toByteArray();

				return createSuccessResponse(excelBytes, mealSetMenuDTO.getTemplateName());

			}

		} catch (Exception e) {
			 log.error("Failed to generate Export Single MealSetMenu Excel Report", e);
			return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	// ======================
	// Helper: Meal Set Summary Row
	// ======================
	private int createMealSetSummaryRows(HSSFSheet sheet, MealSetMenuDTO dto, int startRow, CellStyle strStyle) {
		Row row;
		Cell cell;
		SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
		String date = sdf.format(new Date());

		String[][] summaryData = { { "Generated Date :", date, "Generated By: ", userName },

				{ "Created By: ", dto.getUserName(), "Approver:",
						dto.getApprover() != null ? dto.getApprover() : "N/A" },

				{ "Meal Type:", dto.getMealType() != null ? dto.getMealType() : "N/A", "Template:",
						dto.getTemplateName() != null ? dto.getTemplateName() : "" },

				{ "Total Cost:", String.valueOf(dto.getTotalCost()), "Approval Status:",
						dto.getApprovalStatusStr() != null ? dto.getApprovalStatusStr() : "N/A" },

				{ "Total Categories:", String.valueOf(dto.getCategoryList().size()), "Total Recipes:",
						String.valueOf(dto.getTotalRecipes()) },

				{ "Menu ID:", dto.getId() != 0 ? String.valueOf(dto.getId()) : "Null", "", "" } };

		for (String[] pair : summaryData) {
			row = sheet.createRow(startRow++);
			cell = row.createCell(0);
			cell.setCellValue(pair[0]);
			cell.setCellStyle(strStyle);

			cell = row.createCell(1);
			cell.setCellValue(pair[1]);
			cell.setCellStyle(strStyle);

			cell = row.createCell(2);
			cell.setCellValue(pair[2]);
			cell.setCellStyle(strStyle);

			cell = row.createCell(3);
			cell.setCellValue(pair[3]);
			cell.setCellStyle(strStyle);
		}

		return startRow;
	}

	// Title style - big bold center
	public static CellStyle createTitleStyle(Workbook workbook) {
		CellStyle style = workbook.createCellStyle();
		Font font = workbook.createFont();
		font.setBold(true);
		font.setColor(IndexedColors.BLACK.getIndex());
		style.setFont(font);
		style.setAlignment(HorizontalAlignment.CENTER);
		style.setVerticalAlignment(VerticalAlignment.CENTER);
		return style;
	}

	// Centered style (for serial numbers or small numeric values)
	public static CellStyle createCenterStyle(Workbook workbook) {
		CellStyle style = workbook.createCellStyle();
		style.setAlignment(HorizontalAlignment.CENTER);
		style.setVerticalAlignment(VerticalAlignment.CENTER);
		setBorders(style);
		return style;
	}

	// Number style (for cost, totals, etc.)
	public static CellStyle createNumberStyle(Workbook workbook) {
		CellStyle style = workbook.createCellStyle();
		style.setAlignment(HorizontalAlignment.CENTER);
		style.setVerticalAlignment(VerticalAlignment.CENTER);
		style.setDataFormat(workbook.createDataFormat().getFormat("#,##0.00"));
		setBorders(style);
		return style;
	}

	// Helper method to set thin borders
	public static void setBorders(CellStyle style) {
		style.setBorderBottom(BorderStyle.THIN);
		style.setBorderTop(BorderStyle.THIN);
		style.setBorderLeft(BorderStyle.THIN);
		style.setBorderRight(BorderStyle.THIN);
	}

}
