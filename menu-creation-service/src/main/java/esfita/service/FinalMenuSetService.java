package esfita.service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.Serializable;
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

import org.apache.poi.hssf.usermodel.HSSFCellStyle;
import org.apache.poi.hssf.usermodel.HSSFFont;
import org.apache.poi.hssf.usermodel.HSSFRow;
import org.apache.poi.hssf.usermodel.HSSFSheet;
import org.apache.poi.hssf.usermodel.HSSFWorkbook;
import org.apache.poi.ss.usermodel.BorderStyle;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.Font;
import org.apache.poi.ss.usermodel.HorizontalAlignment;
import org.apache.poi.ss.usermodel.IndexedColors;
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
import esfita.dto.FinalMenuSetDTO;
import esfita.dto.ResponseDTO;
import esfita.entity.FinalSetMenuDHib;
import esfita.entity.FinalSetMenuHHib;
import esfita.entity.FinalSetMenuIHib;
import esfita.entity.FinalSetMenuMHib;
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
import esfita.repository.FinalSetMenuDRepository;
import esfita.repository.FinalSetMenuHRepository;
import esfita.repository.FinalSetMenuIRepository;
import esfita.repository.FinalSetMenuMRepository;
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
public class FinalMenuSetService implements Serializable {

	private static final long serialVersionUID = -5659762855850325052L;

	private static final Logger LOGGER = LoggerFactory.getLogger(FinalMenuSetService.class);

	public static final String STATUS_DRAFT = "Draft";
	public static final String STATUS_APPROVED = "Approved";
	public static final String STATUS_PENDING = "Pending";
	public static final String STATUS_REJECTED = "Rejected";
	public static final String STATUS_UNKNOWN = "Unknown";
	private static final String EMPTY_STRING = "";
	private static final String NOT_ASSIGNED = "Not Assigned";

	private static final int APPROVAL_STATUS_DRAFT = 3;
	private static final int APPROVAL_STATUS_APPROVED = 0;
	private static final int APPROVAL_STATUS_PENDING = 1;
	private static final int APPROVAL_STATUS_REJECTED = 2;

	private final transient MealSetTemplateHRepository mealSetTemplateHRepository;
	private final transient MealSetTemplateDRepository mealSetTemplateDRepository;
	private final transient MstUserRepository mstUserRepository;
	private final transient RecipeMealMasterRepository recipeMealMasterRepository;
	private final transient MstCategoryMasterRepository mstCategoryMasterRepository;
	private final transient MealSetMenuDRepository mealSetMenuDRepository;
	private final transient MealSetMenuHRepository mealSetMenuHRepository;
	private final transient MealSetMenuIRepository mealSetMenuIRepository;
	private final transient RecipeHRepository recipeHRepository;
	private final transient RecipeDRepository recipeDRepository;
	private final transient FinalSetMenuDRepository finalSetMenuDRepository;
	private final transient FinalSetMenuMRepository finalSetMenuMRepository;
	private final transient FinalSetMenuHRepository finalSetMenuHRepository;
	private final transient FinalSetMenuIRepository finalSetMenuIRepository;

	public FinalMenuSetService(MealSetTemplateHRepository mealSetTemplateHRepository,
			MealSetTemplateDRepository mealSetTemplateDRepository, MstUserRepository mstUserRepository,
			RecipeMealMasterRepository recipeMealMasterRepository,
			MstCategoryMasterRepository mstCategoryMasterRepository, MealSetMenuDRepository mealSetMenuDRepository,
			MealSetMenuHRepository mealSetMenuHRepository, MealSetMenuIRepository mealSetMenuIRepository,
			RecipeHRepository recipeHRepository, RecipeDRepository recipeDRepository,
			FinalSetMenuDRepository finalSetMenuDRepository, FinalSetMenuMRepository finalSetMenuMRepository,
			FinalSetMenuHRepository finalSetMenuHRepository, FinalSetMenuIRepository finalSetMenuIRepository) {
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
		this.finalSetMenuDRepository = finalSetMenuDRepository;
		this.finalSetMenuMRepository = finalSetMenuMRepository;
		this.finalSetMenuHRepository = finalSetMenuHRepository;
		this.finalSetMenuIRepository = finalSetMenuIRepository;
	}

	public ResponseDTO<List<ComboBoxDTO>> loadMealTypeDropDown() {
		ResponseDTO<List<ComboBoxDTO>> response = new ResponseDTO<>();
		List<ComboBoxDTO> comboList = new ArrayList<>();
		try {
			List<RecipeMealMasterHib> mealMASTERHIB = recipeMealMasterRepository.orderBy();
			if (mealMASTERHIB != null && !mealMASTERHIB.isEmpty()) {
				for (RecipeMealMasterHib hib : mealMASTERHIB) {
					ComboBoxDTO dto = new ComboBoxDTO();
					dto.setPk(hib.getId());
					dto.setName(hib.getRecipeMealName());
					dto.setCode(hib.getRecipeMealCode());
					comboList.add(dto);
				}
				response.setSuccess(AppConstants.TRUE);
			} else {
				response.setSuccess(AppConstants.FALSE);
				response.setMessage(AppConstants.E_DATA);
			}

			response.setData(comboList);
		} catch (RestException re) {
			response.setSuccess(AppConstants.FALSE);
			LOGGER.warn(AppConstants.REST_EXCEPTION + "Recipe Meal Name", re);
		} catch (Exception e) {
			response.setSuccess(AppConstants.FALSE);
			LOGGER.error(AppConstants.EXCEPTION + " Recipe Meal Name", e);
		}
		return response;
	}

	private String getApproverName(Integer approverId) {
		if (approverId == null) {
			return EMPTY_STRING;
		}
		return mstUserRepository.findById(approverId).map(MstUserHib::getFirstName).orElse(EMPTY_STRING);
	}

	public ResponseDTO<FinalMenuSetDTO> finalMenuList(FinalMenuSetDTO filterDto) {
		ResponseDTO<FinalMenuSetDTO> response = new ResponseDTO<>();

		try {
			Integer mealTypeFk = filterDto.getMealTypeFk();
			Integer approvalStatus = filterDto.getApprovalStatus();

			// Step 1 — Fetch all M records
			List<FinalSetMenuMHib> mList = finalSetMenuMRepository.findMByMealTypeAndApprovalStatus(mealTypeFk,
					approvalStatus);
			if (mList.isEmpty()) {
				response.setSuccess(AppConstants.FALSE);
				response.setMessage(AppConstants.EMPTY);
				return response;
			}

			// Step 2 — Fetch all H records for these M ids in one call
			List<Integer> mIds = mList.stream().map(FinalSetMenuMHib::getId).toList();
			List<FinalSetMenuHHib> allHRecords = finalSetMenuHRepository.findActiveByMenuFks(mIds); // single DB call
			Map<Integer, List<FinalSetMenuHHib>> hRecordsByMId = allHRecords.stream()
					.collect(Collectors.groupingBy(FinalSetMenuHHib::getFinalMenuFk));

			// Step 3 — Build DTO list
			List<FinalMenuSetDTO> dtoList = mList.stream().map(m -> {
				FinalMenuSetDTO dto = new FinalMenuSetDTO();
				dto.setId(m.getId());
				dto.setFinalMenuName(m.getName());
				dto.setStatus(m.getStatus());
				dto.setTotalCost(m.getTotal());
				dto.setUserName(getApproverName(m.getCreatedBy()));
				dto.setCreatedDate(m.getCreatedDateTime());
				dto.setApprovalStatus(m.getApprovalStatus());
				dto.setApprover(getApproverName(m.getApprovedBy()));
				dto.setUpdatedDate(m.getLastActDateTime());
				dto.setApprovalStatusStr(getApprovalStatusString(m.getApprovalStatus()));
				dto.setStatusStr(getStatusString(m.getStatus()));

				List<FinalSetMenuHHib> hList = hRecordsByMId.getOrDefault(m.getId(), Collections.emptyList());
				List<FinalMenuSetDTO> hDtoList = hList.stream().map(h -> {
					FinalMenuSetDTO hDto = new FinalMenuSetDTO();
					hDto.setId(h.getId());
					hDto.setMealTypeName(h.getMealTypeName());
					hDto.setMenuName(h.getMenuName());
					hDto.setRecipeCount(h.getRecipeCount());
					return hDto;
				}).toList();

				int totalRecipeCount = hList.stream().mapToInt(FinalSetMenuHHib::getRecipeCount).sum();
				dto.setRecipeCount(totalRecipeCount);
				dto.setDetailList(hDtoList);

				return dto;
			}).toList();

			// Step 4 — Summary (single DB call)
			FinalMenuSetDTO summaryDto = new FinalMenuSetDTO();
			finalSetMenuMRepository.getMenuSummary().stream().findFirst().ifPresent(s -> {
				summaryDto.setTotalMenu(((Number) s[0]).intValue());
				summaryDto.setActiveMenu(((Number) s[1]).intValue());
				summaryDto.setPendingApproval(((Number) s[2]).intValue());
				summaryDto.setAverageCost(((Number) s[3]).doubleValue());
			});

			summaryDto.setFinalSetMenuList(dtoList);
			summaryDto.setUserName(getApproverName(filterDto.getCreatedBy()));

			response.setData(summaryDto);
			response.setSuccess(AppConstants.TRUE);
			response.setMessage(AppConstants.MSG_RECORD_FETCHED);

		} catch (Exception e) {
			LOGGER.error("Error fetching Final MenuList", e);
			response.setSuccess(AppConstants.FALSE);
			response.setMessage("Unexpected error occurred while fetching Final Menu List.");
		}

		return response;
	}

	private String getApprovalStatusString(Integer approvalStatus) {
		if (approvalStatus == null) {
			return STATUS_UNKNOWN;
		}

		switch (approvalStatus) {
		case APPROVAL_STATUS_DRAFT:
			return STATUS_DRAFT;
		case APPROVAL_STATUS_APPROVED:
			return STATUS_APPROVED;
		case APPROVAL_STATUS_PENDING:
			return STATUS_PENDING;
		case APPROVAL_STATUS_REJECTED:
			return STATUS_REJECTED;
		default:
			return STATUS_UNKNOWN;
		}
	}

	private String getStatusString(Character status) {
		if (status == null) {
			return STATUS_UNKNOWN;
		}

		switch (status) {
		case 'A':
			return "Active";
		case 'I':
			return "Inactive";
		default:
			return STATUS_UNKNOWN;
		}
	}

	public ResponseDTO<FinalMenuSetDTO> finalMenuListOld(FinalMenuSetDTO filterDto) {
		ResponseDTO<FinalMenuSetDTO> response = new ResponseDTO<>();
		List<FinalMenuSetDTO> dtoList = new ArrayList<>();

		try {
			Integer mealTypeFk = filterDto.getMealTypeFk();
			Integer approvalStatus = filterDto.getApprovalStatus();

			// Step 1 — Get M data filtered via H table
			List<FinalSetMenuMHib> mList = finalSetMenuMRepository.findMByMealTypeAndApprovalStatus(mealTypeFk,
					approvalStatus);
			if (mList.isEmpty()) {
				response.setSuccess(AppConstants.FALSE);
				response.setMessage(AppConstants.EMPTY);
				return response;
			}

			// Step 2 — For each M row, fetch matching H list
			for (FinalSetMenuMHib m : mList) {

				FinalMenuSetDTO dto = new FinalMenuSetDTO();
				dto.setId(m.getId());
				dto.setFinalMenuName(m.getName());
				dto.setStatus(m.getStatus());
				dto.setTotalCost(m.getTotal());
				dto.setCreatedDate(m.getCreatedDateTime());
				dto.setApprovalStatus(m.getApprovalStatus());

				// Convert approval status to string
				dto.setApprovalStatusStr(getApprovalStatusString(m.getApprovalStatus()));

				List<FinalSetMenuHHib> hList = finalSetMenuHRepository.findActiveByMenuDFk(m.getId());

				List<FinalMenuSetDTO> hDtoList = new ArrayList<>();
				int totalRecipeCount = 0;
				for (FinalSetMenuHHib h : hList) {
					FinalMenuSetDTO hDto = new FinalMenuSetDTO();
					hDto.setId(h.getId());
					hDto.setMealTypeName(h.getMealTypeName());
					hDto.setMenuName(h.getMenuName());
					hDto.setRecipeCount(h.getRecipeCount());

					totalRecipeCount += h.getRecipeCount();
					hDtoList.add(hDto);
				}

				dto.setRecipeCount(totalRecipeCount); // cumulative count if needed
				dto.setDetailList(hDtoList); // store full sublist

				dtoList.add(dto);
			}

			// Step 3 — Summary
			FinalMenuSetDTO summaryDto = new FinalMenuSetDTO();
			List<Object[]> summaryList = finalSetMenuMRepository.getMenuSummary();
			if (!summaryList.isEmpty()) {
				Object[] s = summaryList.get(0);
				summaryDto.setTotalMenu(((Number) s[0]).intValue());
				summaryDto.setActiveMenu(((Number) s[1]).intValue());
				summaryDto.setPendingApproval(((Number) s[2]).intValue());
				summaryDto.setAverageCost(((Number) s[3]).doubleValue());
			}
			summaryDto.setFinalSetMenuList(dtoList);

			response.setData(summaryDto);
			response.setSuccess(AppConstants.TRUE);
			response.setMessage(AppConstants.MSG_RECORD_FETCHED);

		} catch (Exception e) {
			LOGGER.error("Error fetching Final Menu List", e);
			response.setSuccess(AppConstants.FALSE);
		}

		return response;
	}

	public ResponseDTO<FinalMenuSetDTO> finalSetMenuApprovalStatus(FinalMenuSetDTO dto) {
		ResponseDTO<FinalMenuSetDTO> response = new ResponseDTO<>();

		try {
			if (dto != null) {
				Optional<FinalSetMenuMHib> existingMenu1 = finalSetMenuMRepository.findById(dto.getId());

				if (existingMenu1.isPresent()) {

					FinalSetMenuMHib existingMenu = existingMenu1.get();
					existingMenu.setApprovalStatus(dto.getApprovalStatus());
					existingMenu.setApprovedBy(dto.getApproverBy());

					existingMenu.setLastActBy(dto.getApproverBy());
					existingMenu.setLastActDateTime(new Date());

					finalSetMenuMRepository.save(existingMenu);
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
			LOGGER.error(AppConstants.DATA_EXCEPTION_SAVE + " Final Set Menu ", dae);
			response.setSuccess(AppConstants.FALSE);
			response.setMessage(AppConstants.DATA_EXCEPTION_SAVE);
		} catch (RestException re) {
			LOGGER.warn(AppConstants.REST_EXCEPTION_SAVE + " Final Set Menu", re);
			response.setSuccess(AppConstants.FALSE);
			response.setMessage(re.getMessage());
		} catch (Exception e) {
			LOGGER.error(AppConstants.EXCEPTION_SAVING + " Final Set Menu", e);
			response.setSuccess(AppConstants.FALSE);
			response.setMessage(AppConstants.EXCEPTION_SAVING);
		}

		return response;
	}

	public ResponseDTO<FinalMenuSetDTO> finalMenuSetStatusUpdate(FinalMenuSetDTO dto) {
		ResponseDTO<FinalMenuSetDTO> response = new ResponseDTO<>();
		try {
			if (null != dto && 0 != dto.getId()) {

				Optional<FinalSetMenuMHib> hib1 = finalSetMenuMRepository.findById(dto.getId());
				if (hib1.isPresent()) {

					FinalSetMenuMHib hib = hib1.get();
					char status = Character.toUpperCase(dto.getStatus());
					if (status == AppConstants.FLAG_A) {
						hib.setStatus(AppConstants.FLAG_A);
						response.setMessage(AppConstants.ACTIVATED);
					} else if (status == AppConstants.FLAG_I) {
						hib.setStatus(AppConstants.FLAG_I);
						response.setMessage(AppConstants.INACTIVATED);
					} else {
						response.setSuccess(false);
						response.setMessage("Invalid status");
						return response;
					}
					finalSetMenuMRepository.save(hib);
					response.setSuccess(true);
				} else {
					response.setSuccess(false);
					response.setMessage(AppConstants.EMPTY);
				}
			} else {
				response.setSuccess(false);
				response.setMessage(AppConstants.E_DATA);
			}
		} catch (RestException exception) {
			LOGGER.warn(AppConstants.REST_EXCEPTION_UPDATE + " Final Menu Set ", exception);
			response.setSuccess(AppConstants.FALSE);
			response.setMessage(AppConstants.REST_EXCEPTION_UPDATE);
		} catch (Exception e) {
			LOGGER.error(AppConstants.EXCEPTION_UPDATE + " Final Menu Set", e);
			response.setSuccess(AppConstants.FALSE);
			response.setMessage(AppConstants.EXCEPTION_UPDATE);
		}
		return response;
	}

	public ResponseDTO<FinalMenuSetDTO> finalMenuView(int id) {
		ResponseDTO<FinalMenuSetDTO> response = new ResponseDTO<>();

		try {
			Optional<FinalSetMenuMHib> hibOpt = finalSetMenuMRepository.findById(id);
			if (hibOpt.isEmpty()) {
				response.setSuccess(AppConstants.FALSE);
				response.setMessage(AppConstants.EMPTY);
				return response;
			}

			FinalSetMenuMHib hib = hibOpt.get();
			FinalMenuSetDTO dto = new FinalMenuSetDTO();
			dto.setId(hib.getId());
			dto.setFinalMenuName(hib.getName());
			dto.setStatus(hib.getStatus());
			dto.setTotalCost(hib.getTotal());
			dto.setCreatedDate(hib.getCreatedDateTime());
			dto.setApprovalStatus(hib.getApprovalStatus());
			dto.setNotes(hib.getNotes());
			dto.setApprover(
					mstUserRepository.findById(hib.getApprovedBy()).map(MstUserHib::getFirstName).orElse(NOT_ASSIGNED));
			dto.setUserName(getApproverName(hib.getCreatedBy()));
			dto.setUpdatedDate(hib.getLastActDateTime());

			// Approval status string
			dto.setApprovalStatusStr(getApprovalStatusString(hib.getApprovalStatus()));

			// Fetch all H records in one DB call
			List<FinalSetMenuHHib> hList = finalSetMenuHRepository.findActiveByMenuDFk(id);

			List<FinalMenuSetDTO> hDtoList = hList.stream().map(h -> {
				FinalMenuSetDTO hDto = new FinalMenuSetDTO();
				hDto.setId(h.getId());
				hDto.setMenuFk(h.getMenuFk());
				hDto.setMealTypeName(h.getMealTypeName());
				hDto.setMenuName(h.getMenuName());
				hDto.setRecipeCount(h.getRecipeCount());
				hDto.setRecipeCost(h.getTotalCost());
				return hDto;
			}).toList();

			// Cumulative totals
			int totalRecipeCount = hList.stream().mapToInt(FinalSetMenuHHib::getRecipeCount).sum();
			dto.setRecipeCount(totalRecipeCount);
			dto.setMealTypeCount(hDtoList.size());
			dto.setDetailList(hDtoList);

			response.setData(dto);
			response.setSuccess(AppConstants.TRUE);
			response.setMessage(AppConstants.MSG_RECORD_FETCHED);

		} catch (Exception e) {
			LOGGER.error("Error fetching Final Menu List", e);
			response.setSuccess(AppConstants.FALSE);
			response.setMessage("Unexpected error occurred while fetching Final Menu.");
		}

		return response;
	}

	// Add Menu_fk Column
	public ResponseDTO<FinalMenuSetDTO> finalMenuSetViewByMenu(int finalFk, int menuFk) {
		ResponseDTO<FinalMenuSetDTO> response = new ResponseDTO<>();

		try {
			FinalSetMenuHHib hib = finalSetMenuHRepository.findHeadersByMenuFk(finalFk, menuFk);
			if (hib == null) {
				response.setSuccess(AppConstants.FALSE);
				response.setMessage(AppConstants.EMPTY + "Final Menu Set not found for ID: " + finalFk + "-" + menuFk);
				LOGGER.warn("Final Menu Set not found for ID: {}-{}", finalFk, menuFk);
				return response;
			}

			FinalMenuSetDTO dto = new FinalMenuSetDTO();
			dto.setId(hib.getId());
			dto.setFinalMenuFk(hib.getFinalMenuFk());
			dto.setMenuName(hib.getMenuName());
			dto.setMealType(hib.getMealTypeName());
			dto.setTotalCost(hib.getTotalCost());
			dto.setApprovalStatus(hib.getApprovalStatus());
			dto.setApprovalStatusStr(getApprovalStatusString(hib.getApprovalStatus()));

			dto.setApprover(
					mstUserRepository.findById(hib.getApprovedBy()).map(MstUserHib::getFirstName).orElse(NOT_ASSIGNED));

			// Fetch category + recipes
			List<FinalSetMenuDHib> catList = finalSetMenuDRepository.findByActCat(finalFk, menuFk);
			if (catList != null && !catList.isEmpty()) {
				Map<Integer, List<FinalSetMenuDHib>> groupedByCategory = catList.stream()
						.collect(Collectors.groupingBy(FinalSetMenuDHib::getCategoryFk));

				List<FinalMenuSetDTO> categoryList = groupedByCategory.entrySet().stream().map(entry -> {
					int categoryFk = entry.getKey();
					List<FinalSetMenuDHib> recipes = entry.getValue();

					FinalMenuSetDTO categoryDto = new FinalMenuSetDTO();
					categoryDto.setCategoryFk(categoryFk);
					categoryDto.setCategoriesName(recipes.get(0).getCategoryName());

					List<FinalMenuSetDTO> recipeDtos = recipes.stream().map(hibD -> {
						FinalMenuSetDTO recipeDto = new FinalMenuSetDTO();
						recipeDto.setRecipeName(hibD.getRecipeName());
						recipeDto.setRecipeCost(hibD.getPerPortionCost());
						LOGGER.debug("Per portion cost: {}", hibD.getPerPortionCost());

						recipeDto.setPerPortionSize(hibD.getPortionSize());
						recipeDto.setUom(hibD.getUom());
						return recipeDto;
					}).toList();

					categoryDto.setRecipes(recipeDtos);
					return categoryDto;
				}).toList();

				int totalRecipeCount = (int) categoryList.stream().flatMap(c -> c.getRecipes().stream()).count();

				dto.setCategoryList(categoryList);
				dto.setCategoryCount(categoryList.size());
				dto.setRecipeCount(totalRecipeCount);
			}

			response.setData(dto);
			response.setSuccess(AppConstants.TRUE);
			response.setMessage(AppConstants.MSG_RECORD_FETCHED);
			LOGGER.info("Meal Set Menu fetched successfully for finalFk: {}, menuFk: {}", finalFk, menuFk);

		} catch (RestException re) {
			LOGGER.warn("RestException - Final Menu Set not found for ID: {}-{}", finalFk, menuFk, re);
			response.setSuccess(AppConstants.FALSE);
			response.setMessage(AppConstants.REST_EXCEPTION);
		} catch (Exception e) {
			LOGGER.error("Error fetching Final Menu Set by ID: {}-{}", finalFk, menuFk, e);
			response.setSuccess(AppConstants.FALSE);
			response.setMessage(AppConstants.EXCEPTION);
		}

		return response;
	}

	public ResponseDTO<List<ComboBoxDTO>> loadMealSetMenuDropDown(int mealTypeFk) {
		ResponseDTO<List<ComboBoxDTO>> response = new ResponseDTO<>();
		List<ComboBoxDTO> comboList = new ArrayList<>();
		try {
			List<MealSetMenuHHib> mealSETMENUHHIB = mealSetMenuHRepository.findActByFk(mealTypeFk);
			if (mealSETMENUHHIB != null && !mealSETMENUHHIB.isEmpty()) {
				for (MealSetMenuHHib hib : mealSETMENUHHIB) {
					ComboBoxDTO dto = new ComboBoxDTO();
					dto.setPk(hib.getId());
					dto.setFk(mealTypeFk);
					dto.setName(hib.getMenuName());
					dto.setMeal(hib.getMealTypeName());
					dto.setCount(hib.getRecipeCount());
					dto.setCost(hib.getTotalCost());
					dto.setCategoryCount(hib.getCategoryCount());
					comboList.add(dto);
				}
				response.setSuccess(AppConstants.TRUE);
			} else {
				response.setSuccess(AppConstants.FALSE);
				response.setMessage(AppConstants.E_DATA);
			}
			response.setData(comboList);
		} catch (RestException re) {
			response.setSuccess(AppConstants.FALSE);
			LOGGER.warn(AppConstants.REST_EXCEPTION + " Meal menu Name", re);
		} catch (Exception e) {
			response.setSuccess(AppConstants.FALSE);
			LOGGER.error(AppConstants.EXCEPTION + " Meal menu Name", e);
		}
		return response;
	}

	public ResponseDTO<FinalMenuSetDTO> saveFinalSetMenu(FinalMenuSetDTO dto) {

		if (dto == null) {
			return failure("Empty data");
		}

		try {
			FinalSetMenuMHib master = saveMaster(dto);

			for (FinalMenuSetDTO headerDTO : dto.getSelectedMeals()) {
				processHeaderAndDetails(dto, master, headerDTO);
			}

			return success();

		} catch (Exception e) {
			LOGGER.error("Error while saving Final Set Menu", e);
			return failure("Unexpected error occurred. Please contact support.");
		}
	}

	private ResponseDTO<FinalMenuSetDTO> success() {
		ResponseDTO<FinalMenuSetDTO> r = new ResponseDTO<>();
		r.setSuccess(AppConstants.TRUE);
		r.setMessage(AppConstants.MSG_RECORD_CREATED);
		return r;
	}

	private ResponseDTO<FinalMenuSetDTO> failure(String msg) {
		ResponseDTO<FinalMenuSetDTO> r = new ResponseDTO<>();
		r.setSuccess(AppConstants.FALSE);
		r.setMessage(msg);
		return r;
	}

	private FinalSetMenuMHib saveMaster(FinalMenuSetDTO dto) {

		FinalSetMenuMHib master = new FinalSetMenuMHib();

		master.setName(dto.getMenuName().trim().toUpperCase());
		master.setNotes(dto.getNotes());
		master.setTotal(dto.getTotalCost());
		master.setTotalRecipeCount(dto.getTotalRecipeCount());
		master.setApprovedBy(dto.getCreatedBy());
		master.setApprovalStatus(APPROVAL_STATUS_DRAFT);
		master.setMealTypeFk(dto.getMealTypeFk());
		master.setStatus(AppConstants.FLAG_A);
		master.setCreatedBy(dto.getCreatedBy());
		master.setCreatedDateTime(new Date());
		master.setLastActBy(dto.getCreatedBy());
		master.setLastActDateTime(new Date());

		return finalSetMenuMRepository.save(master);
	}

	private void processHeaderAndDetails(FinalMenuSetDTO dto, FinalSetMenuMHib master, FinalMenuSetDTO headerDTO) {

		MealSetMenuHHib header = fetchMealSetHeader(headerDTO.getMenuFk());

		saveHeader(dto, master, headerDTO, header);

		List<MealSetMenuDHib> existingDetails = mealSetMenuDRepository.findActiveByMenuFk(header.getId());

		if (hasCustomDetails(headerDTO)) {
			saveCustomDetails(dto, master, headerDTO, existingDetails);
		} else {
			saveExistingDetails(dto, master, headerDTO, existingDetails);
		}
	}

	private MealSetMenuHHib fetchMealSetHeader(Integer menuFk) {

		return mealSetMenuHRepository.findById(menuFk)
				.orElseThrow(() -> new IllegalArgumentException("No record found for the Menu."));
	}

	private FinalSetMenuHHib saveHeader(FinalMenuSetDTO dto, FinalSetMenuMHib master, FinalMenuSetDTO headerDTO,
			MealSetMenuHHib src) {

		FinalSetMenuHHib h = new FinalSetMenuHHib();

		h.setFinalMenuFk(master.getId());
		h.setMealTypeFk(src.getMealTypeFk());
		h.setMealTypeName(src.getMealTypeName());
		h.setTemplateFk(src.getTemplateFk());
		h.setMenuFk(headerDTO.getMenuFk());
		h.setTemplateName(src.getTemplateName());
		h.setMenuName(src.getMenuName());
		h.setCategoryCount(headerDTO.getCategoryCount());
		h.setRecipeCount(headerDTO.getRecipeCount());
		h.setTotalCost(headerDTO.getCost());
		h.setStatus(AppConstants.FLAG_A);
		h.setApprovalStatus(src.getApprovalStatus());
		h.setApprovedBy(dto.getCreatedBy());
		h.setCreatedBy(dto.getCreatedBy());
		h.setCreatedDateTime(new Date());
		h.setLastActBy(dto.getCreatedBy());
		h.setLastActDateTime(new Date());

		return finalSetMenuHRepository.save(h);
	}

	private boolean hasCustomDetails(FinalMenuSetDTO headerDTO) {
		return headerDTO.getDetailList() != null && !headerDTO.getDetailList().isEmpty();
	}

	private void saveCustomDetails(FinalMenuSetDTO dto, FinalSetMenuMHib master, FinalMenuSetDTO headerDTO,
			List<MealSetMenuDHib> existingDetails) {

		for (FinalMenuSetDTO detailDTO : headerDTO.getDetailList()) {

			MealSetMenuDHib matched = findMatchedRecipe(existingDetails, detailDTO.getRecipeFk());

			if (matched != null) {
				saveMatchedRecipe(dto, master, headerDTO, matched);
			} else {
				saveUnmatchedRecipe(dto, master, headerDTO, detailDTO);
			}
		}
	}

	private MealSetMenuDHib findMatchedRecipe(List<MealSetMenuDHib> list, Integer recipeFk) {

		return list.stream().filter(m -> Objects.equals(m.getRecipeFk(), recipeFk)).findFirst().orElse(null);
	}

	private void saveMatchedRecipe(FinalMenuSetDTO dto, FinalSetMenuMHib master, FinalMenuSetDTO headerDTO,
			MealSetMenuDHib matched) {

		FinalSetMenuDHib saved = copyDetailFromMealSet(dto, master, headerDTO, matched);

// copy items
		List<MealSetMenuIHib> items = mealSetMenuIRepository.findActiveByMenuDFk(matched.getId());

		items.forEach(i -> copyItemFromMealMenu(dto, master, headerDTO, saved, i));
	}

	private void saveUnmatchedRecipe(FinalMenuSetDTO dto, FinalSetMenuMHib master, FinalMenuSetDTO headerDTO,
			FinalMenuSetDTO detailDTO) {

		RecipeHHib recipe = recipeHRepository.findById(detailDTO.getRecipeFk()).orElseThrow();

		FinalSetMenuDHib saved = copyDetailFromRecipe(dto, master, headerDTO, recipe, detailDTO);

		List<RecipeDHib> ingredients = recipeDRepository.findByActRecipe(recipe.getId());

		ingredients.forEach(ing -> copyItemFromRecipe(dto, master, headerDTO, saved, recipe, ing));
	}

	private void saveExistingDetails(FinalMenuSetDTO dto, FinalSetMenuMHib master, FinalMenuSetDTO headerDTO,
			List<MealSetMenuDHib> details) {

		if (details == null || details.isEmpty()) {
			throw new IllegalArgumentException("No record found for the Menu.");
		}

		for (MealSetMenuDHib d : details) {

			FinalSetMenuDHib saved = copyDetailFromMealSet(dto, master, headerDTO, d);

			List<MealSetMenuIHib> items = mealSetMenuIRepository.findActiveByMenuDFk(d.getId());

			items.forEach(i -> copyItemFromMealMenu(dto, master, headerDTO, saved, i));
		}
	}

	private FinalSetMenuDHib copyDetailFromMealSet(FinalMenuSetDTO dto, FinalSetMenuMHib master,
			FinalMenuSetDTO headerDTO, MealSetMenuDHib src) {

		FinalSetMenuDHib d = new FinalSetMenuDHib();

		d.setMenuFk(headerDTO.getMenuFk());
		d.setFinalMenuFk(master.getId());
		d.setCategoryFk(src.getCategoryFk());
		d.setCategoryName(src.getCategoryName());
		d.setRecipeFk(src.getRecipeFk());
		d.setUniqueNo(src.getUniqueNo());
		d.setRecipeName(src.getRecipeName());
		d.setRefNo(src.getRefNo());
		d.setCookingInstruction(src.getCookingInstruction());
		d.setCountryOriginFk(src.getCountryOriginFk());
		d.setBaseQuantityFk(src.getBaseQuantityFk());
		d.setBaseQuantity(src.getBaseQuantity());
		d.setUom(src.getUom());
		d.setFinishedProduct(src.getFinishedProduct());
		d.setPortionSize(src.getPortionSize());
		d.setImageUrl(src.getImageUrl());
		d.setTotalCost(src.getTotalCost());
		d.setPerPortionCost(src.getPerPortionCost());
		d.setStatus(AppConstants.FLAG_A);
		d.setCreatedBy(dto.getCreatedBy());
		d.setCreatedDateTime(new Date());
		d.setLastActBy(dto.getCreatedBy());
		d.setLastActDateTime(new Date());

		return finalSetMenuDRepository.save(d);
	}

	private FinalSetMenuDHib copyDetailFromRecipe(FinalMenuSetDTO dto, FinalSetMenuMHib master,
			FinalMenuSetDTO headerDTO, RecipeHHib recipe, FinalMenuSetDTO src) {

		FinalSetMenuDHib d = new FinalSetMenuDHib();

		d.setMenuFk(headerDTO.getMenuFk());
		d.setFinalMenuFk(master.getId());
		d.setCategoryFk(src.getCategoryFk());
		d.setCategoryName(src.getCategoryName());
		d.setRecipeFk(recipe.getId());
		d.setUniqueNo(recipe.getUniqueNo());
		d.setRecipeName(recipe.getRecipeName());
		d.setRefNo(recipe.getRefNo());
		d.setCookingInstruction(recipe.getCookingInstruction());
		d.setCountryOriginFk(recipe.getCountryOriginFk());
		d.setBaseQuantityFk(recipe.getBaseQuantityFk());
		d.setBaseQuantity(recipe.getBaseQuantity());
		d.setUom(recipe.getUom());
		d.setFinishedProduct(recipe.getFinishedProduct());
		d.setPortionSize(recipe.getPortionSize());
		d.setImageUrl(recipe.getImageUrl());
		d.setTotalCost(recipe.getTotalCost());
		d.setPerPortionCost(recipe.getPerPortionCost());
		d.setStatus(AppConstants.FLAG_A);
		d.setCreatedBy(dto.getCreatedBy());
		d.setCreatedDateTime(new Date());
		d.setLastActBy(dto.getCreatedBy());
		d.setLastActDateTime(new Date());

		return finalSetMenuDRepository.save(d);
	}

	private void copyItemFromMealMenu(FinalMenuSetDTO dto, FinalSetMenuMHib master, FinalMenuSetDTO headerDTO,
			FinalSetMenuDHib savedDetail, MealSetMenuIHib src) {

		FinalSetMenuIHib item = new FinalSetMenuIHib();

		item.setMenuFk(headerDTO.getMenuFk());
		item.setMenuDFk(savedDetail.getId());
		item.setFinalMenuFk(master.getId());
		item.setRecipeFk(savedDetail.getRecipeFk());
		item.setCategoryFk(src.getCategoryFk());
		item.setCategoryName(src.getCategoryName());
		item.setItemFk(src.getItemFk());
		item.setItemCode(src.getItemCode());
		item.setItemName(src.getItemName());
		item.setPackageId(src.getPackageId());
		item.setPackagePrice(src.getPackagePrice());
		item.setPackageBaseFactor(src.getPackageBaseFactor());
		item.setPackageSecondaryFactor(src.getPackageSecondaryFactor());
		item.setPackageBaseUnit(src.getPackageBaseUnit());
		item.setPackageSecondaryUnit(src.getPackageSecondaryUnit());
		item.setPackageSecondaryCost(src.getPackageSecondaryCost());
		item.setBaseQuantity(src.getBaseQuantity());
		item.setSecondaryQuantity(src.getSecondaryQuantity());
		item.setTotal(src.getTotal());
		item.setStatus(AppConstants.FLAG_A);
		item.setCreatedBy(dto.getCreatedBy());
		item.setCreatedDateTime(new Date());
		item.setLastActBy(dto.getCreatedBy());
		item.setLastActDateTime(new Date());

		finalSetMenuIRepository.save(item);
	}

	private void copyItemFromRecipe(FinalMenuSetDTO dto, FinalSetMenuMHib master, FinalMenuSetDTO headerDTO,
			FinalSetMenuDHib savedDetail, RecipeHHib recipe, RecipeDHib ing) {

		FinalSetMenuIHib item = new FinalSetMenuIHib();

		item.setMenuFk(headerDTO.getMenuFk());
		item.setFinalMenuFk(master.getId());
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
		item.setBaseQuantity(ing.getBaseQuantity() / savedDetail.getBaseQuantity());
		item.setSecondaryQuantity(ing.getSecondaryQuantity() / savedDetail.getBaseQuantity());
		item.setTotal(ing.getTotal() / savedDetail.getBaseQuantity());
		item.setStatus(AppConstants.FLAG_A);
		item.setCreatedBy(dto.getCreatedBy());
		item.setCreatedDateTime(new Date());
		item.setLastActBy(dto.getCreatedBy());
		item.setLastActDateTime(new Date());

		finalSetMenuIRepository.save(item);
	}

	public ResponseDTO<FinalMenuSetDTO> mealSetMenuEditByIdForMenuSet(int id) {
		ResponseDTO<FinalMenuSetDTO> response = new ResponseDTO<>();

		try {
			Optional<MealSetMenuHHib> hibOpt = mealSetMenuHRepository.findById(id);
			if (hibOpt.isEmpty()) {
				response.setSuccess(AppConstants.FALSE);
				response.setMessage(AppConstants.EMPTY + "meal set menu not found for ID: " + id);
				LOGGER.warn("Meal set menu not found for ID: {}", id);
				return response;
			}

			MealSetMenuHHib hib = hibOpt.get();
			FinalMenuSetDTO dto = new FinalMenuSetDTO();
			dto.setId(hib.getId());
			dto.setMealTypeFk(hib.getMealTypeFk());
			dto.setTemplateFk(hib.getTemplateFk());
			dto.setMenuName(hib.getMenuName());
			dto.setTotalMenuCost(hib.getTotalCost());

			// Step 1: Fetch selected recipes once
			List<MealSetMenuDHib> selectedRecipes = mealSetMenuDRepository.findActiveByMenuFk(hib.getId());
			Map<Integer, List<MealSetMenuDHib>> selectedByCategory = selectedRecipes.stream()
					.collect(Collectors.groupingBy(MealSetMenuDHib::getCategoryFk));

			// Step 2: Fetch template and template details
			Optional<MealSetTemplateHHib> templateOpt = mealSetTemplateHRepository.findById(hib.getTemplateFk());
			if (templateOpt.isEmpty()) {
				response.setSuccess(AppConstants.FALSE);
				response.setMessage(AppConstants.EMPTY + "template not found for ID: " + hib.getTemplateFk());
				return response;
			}

			List<MealSetTemplateDHib> templateDetails = mealSetTemplateDRepository
					.findActiveByTemplateFk(templateOpt.get().getId());

			// Step 3: Fetch all recipes for all required categories in one go
			Set<Integer> categoryFks = templateDetails.stream().map(MealSetTemplateDHib::getCategoryFk)
					.collect(Collectors.toSet());

			Map<Integer, List<RecipeHHib>> recipeMap = new HashMap<>();
			for (Integer catFk : categoryFks) {
				recipeMap.put(catFk, recipeHRepository.filterByCategoryFk(catFk));
			}

			// Step 4: Build detail list
			List<FinalMenuSetDTO> detailList = new ArrayList<>();

			for (MealSetTemplateDHib templateD : templateDetails) {
				int repeatCount = templateD.getRecipesRequired();
				List<MealSetMenuDHib> selectedForCategory = selectedByCategory.getOrDefault(templateD.getCategoryFk(),
						Collections.emptyList());

				// Prepare category recipes once
				List<FinalMenuSetDTO> categoryRecipes = recipeMap
						.getOrDefault(templateD.getCategoryFk(), Collections.emptyList()).stream().map(r -> {
							FinalMenuSetDTO rdto = new FinalMenuSetDTO();
							rdto.setRecipeFk(r.getId());
							rdto.setRecipeName(r.getRecipeName());
							rdto.setPerPortionCost(r.getPerPortionCost());
							rdto.setPortionSize(r.getPortionSize());
							rdto.setUom(r.getUom());
							return rdto;
						}).toList();

				for (int i = 0; i < repeatCount; i++) {
					FinalMenuSetDTO detailDTO = new FinalMenuSetDTO();
					detailDTO.setCategoryFk(templateD.getCategoryFk());
					detailDTO.setCategoryName(templateD.getCategoryName());
					detailDTO.setMenuFk(hib.getId());
					detailDTO.setMealTypeFk(hib.getMealTypeFk());
					detailDTO.setRecipeCount(repeatCount);
					detailDTO.setRecipes(categoryRecipes);

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

			LOGGER.info("Meal set menu Details fetched successfully for ID: {}", id);

		} catch (RestException re) {
			LOGGER.warn("Meal set menu not found with ID: {}", id, re);
			response.setSuccess(AppConstants.FALSE);
			response.setMessage(AppConstants.REST_EXCEPTION);
		} catch (Exception e) {
			LOGGER.error("Error fetching meal set menu by ID", e);
			response.setSuccess(AppConstants.FALSE);
			response.setMessage(AppConstants.EXCEPTION);
		}

		return response;
	}

	public ResponseDTO<FinalMenuSetDTO> viewFinalSetMenuById(int id) {
		ResponseDTO<FinalMenuSetDTO> response = new ResponseDTO<>();

		try {
			// ===== 1. Fetch Master =====
			Optional<FinalSetMenuMHib> masterOpt = finalSetMenuMRepository.findById(id);
			if (masterOpt.isEmpty()) {
				response.setSuccess(AppConstants.FALSE);
				response.setMessage("No record found for the Final Set Menu.");
				return response;
			}

			FinalSetMenuMHib master = masterOpt.get();
			FinalMenuSetDTO dto = new FinalMenuSetDTO();
			dto.setId(master.getId());
			dto.setMenuSetName(master.getName());
			dto.setNotes(master.getNotes());
			dto.setTotalCost(master.getTotal());
			dto.setTotalRecipeCount(master.getTotalRecipeCount());

			// ===== 2. Fetch Headers in one go =====
			List<FinalSetMenuHHib> headers = finalSetMenuHRepository.findActiveHeadersByFinalMenuFk(master.getId());
			List<Integer> headerIds = headers.stream().map(FinalSetMenuHHib::getMenuFk).toList();

			// ===== 3. Fetch all Details in one query =====
			List<FinalSetMenuDHib> allDetails = finalSetMenuDRepository.findByMenuFkIn(headerIds);

			// Group details by header MenuFk
			Map<Integer, List<FinalSetMenuDHib>> detailsByHeader = allDetails.stream()
					.collect(Collectors.groupingBy(FinalSetMenuDHib::getMenuFk));

			// ===== 4. Build header DTOs =====
			List<FinalMenuSetDTO> selectedMeals = headers.stream().map(menuH -> {
				FinalMenuSetDTO headerDTO = new FinalMenuSetDTO();
				headerDTO.setMenuFk(menuH.getMenuFk());
				headerDTO.setId(menuH.getId());
				headerDTO.setFinalMenuFk(menuH.getFinalMenuFk());
				headerDTO.setMealTypeFk(menuH.getMealTypeFk());
				headerDTO.setMealTypeName(menuH.getMealTypeName());
				headerDTO.setMenuName(menuH.getMenuName());
				headerDTO.setCategoryCount(menuH.getCategoryCount());
				headerDTO.setRecipeCount(menuH.getRecipeCount());
				headerDTO.setCost(menuH.getTotalCost());

				// Map details for this header
				List<FinalSetMenuDHib> headerDetails = detailsByHeader.getOrDefault(menuH.getMenuFk(),
						Collections.emptyList());
				List<FinalMenuSetDTO> recipeList = headerDetails.stream().map(d -> {
					FinalMenuSetDTO recipeDto = new FinalMenuSetDTO();
					recipeDto.setRecipeFk(d.getRecipeFk());
					recipeDto.setCategoryFk(d.getCategoryFk());
					recipeDto.setCategoryName(d.getCategoryName());
					recipeDto.setRecipeName(d.getRecipeName());
					recipeDto.setPerPortionSize(d.getPortionSize());
					recipeDto.setUom(d.getUom());
					recipeDto.setPerPortionCost(d.getPerPortionCost());
					return recipeDto;
				}).toList();

				headerDTO.setDetailList(recipeList);
				return headerDTO;
			}).toList();

			dto.setSelectedMeals(selectedMeals);
			response.setData(dto);
			response.setSuccess(AppConstants.TRUE);
			response.setMessage(AppConstants.MSG_RECORD_FETCHED);

		} catch (Exception e) {
			LOGGER.error("Error while fetching Final Set Menu by ID", e);
			response.setSuccess(AppConstants.FALSE);
			response.setMessage(AppConstants.EXCEPTION);
		}

		return response;
	}

	public ResponseDTO<FinalMenuSetDTO> finalMenuRecipeEdit(int id, int menuFk) {
		ResponseDTO<FinalMenuSetDTO> response = new ResponseDTO<>();

		try {
			// Step 0: Fetch header
			FinalSetMenuHHib hib = finalSetMenuHRepository.findByMenuFk(id, menuFk);

			if (hib != null) {
				FinalMenuSetDTO dto = new FinalMenuSetDTO();
				dto.setId(hib.getId());
				dto.setMealTypeFk(hib.getMealTypeFk());
				dto.setTemplateFk(hib.getTemplateFk());
				dto.setMenuName(hib.getMenuName());
				dto.setTotalMenuCost(hib.getTotalCost());

				// Step 1: Fetch already selected recipes for this menu
				List<FinalSetMenuDHib> selectedRecipes = finalSetMenuDRepository.findByActCat(id, menuFk);

				// Step 2: Fetch template details
				Optional<MealSetTemplateHHib> templateHib1 = mealSetTemplateHRepository.findById(hib.getTemplateFk());
				List<FinalMenuSetDTO> detailList = new ArrayList<>();

				if (templateHib1.isPresent()) {
					MealSetTemplateHHib templateHib = templateHib1.get();
					List<MealSetTemplateDHib> templateDetails = mealSetTemplateDRepository
							.findActiveByTemplateFk(templateHib.getId());

					// Step 2a: Collect all categoryFks to fetch recipes in a single query
					Set<Integer> categoryFks = templateDetails.stream().map(MealSetTemplateDHib::getCategoryFk)
							.collect(Collectors.toSet());

					// Step 2b: Fetch all recipes for these categories in one DB call
					List<Object[]> recipeObjs = recipeHRepository.findByCategoryFkIn(categoryFks);
					Map<Integer, List<RecipeHHib>> recipesByCategory = new HashMap<>();
					for (Object[] obj : recipeObjs) {
						RecipeHHib recipe = (RecipeHHib) obj[0];
						Integer categoryFk = (Integer) obj[1];
						recipesByCategory.computeIfAbsent(categoryFk, k -> new ArrayList<>()).add(recipe);
					}

					// Step 2c: Build DTOs
					for (MealSetTemplateDHib templateD : templateDetails) {
						int repeatCount = templateD.getRecipesRequired();

						List<FinalSetMenuDHib> selectedForCategory = selectedRecipes.stream()
								.filter(sr -> sr.getCategoryFk() == templateD.getCategoryFk()).toList();

						List<RecipeHHib> recipeMasterList = recipesByCategory.getOrDefault(templateD.getCategoryFk(),
								Collections.emptyList());

						List<FinalMenuSetDTO> categoryRecipes = recipeMasterList.stream().map(type -> {
							FinalMenuSetDTO rdto = new FinalMenuSetDTO();
							rdto.setRecipeFk(type.getId());
							rdto.setRecipeName(type.getRecipeName());
							rdto.setPerPortionCost(type.getPerPortionCost());
							rdto.setPortionSize(type.getPortionSize());
							rdto.setUom(type.getUom());
							return rdto;
						}).toList();

						for (int i = 0; i < repeatCount; i++) {
							FinalMenuSetDTO detailDTO = new FinalMenuSetDTO();
							detailDTO.setCategoryFk(templateD.getCategoryFk());
							detailDTO.setCategoryName(templateD.getCategoryName());
							detailDTO.setMenuFk(hib.getMenuFk());
							detailDTO.setMealTypeFk(hib.getMealTypeFk());
							detailDTO.setRecipeCount(repeatCount);
							detailDTO.setRecipes(categoryRecipes);

							if (i < selectedForCategory.size()) {
								// Fill already selected recipe
								FinalSetMenuDHib selected = selectedForCategory.get(i);
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
				LOGGER.info("meal set menu Details fetched successfully for ID: {}", id);

			} else {
				// Step fallback: check MealSetMenuHHib
				Optional<MealSetMenuHHib> hib11 = mealSetMenuHRepository.findById(menuFk);
				if (hib11.isPresent()) {
					MealSetMenuHHib hib1 = hib11.get();
					FinalMenuSetDTO dto = new FinalMenuSetDTO();
					dto.setId(hib1.getId());
					dto.setMealTypeFk(hib1.getMealTypeFk());
					dto.setTemplateFk(hib1.getTemplateFk());
					dto.setMenuName(hib1.getMenuName());
					dto.setTotalMenuCost(hib1.getTotalCost());

					List<MealSetMenuDHib> selectedRecipes = mealSetMenuDRepository.findActiveByMenuFk(hib1.getId());

					// Group selected recipes by category
					Map<Integer, List<MealSetMenuDHib>> selectedByCategory = selectedRecipes.stream()
							.collect(Collectors.groupingBy(MealSetMenuDHib::getCategoryFk));

					// Collect all categoryFks
					Set<Integer> categoryFks = selectedByCategory.keySet();

					// Fetch all recipes for these categories
					List<Object[]> recipeObjs = recipeHRepository.findByCategoryFkIn(categoryFks);
					Map<Integer, List<RecipeHHib>> recipesByCategory = new HashMap<>();
					for (Object[] obj : recipeObjs) {
						RecipeHHib recipe = (RecipeHHib) obj[0];
						Integer categoryFk = (Integer) obj[1];
						recipesByCategory.computeIfAbsent(categoryFk, k -> new ArrayList<>()).add(recipe);
					}

					List<FinalMenuSetDTO> detailList = new ArrayList<>();

					for (Map.Entry<Integer, List<MealSetMenuDHib>> entry : selectedByCategory.entrySet()) {
						int categoryFk = entry.getKey();
						List<MealSetMenuDHib> selectedForCategory = entry.getValue();

						List<RecipeHHib> recipeMasterList = recipesByCategory.getOrDefault(categoryFk,
								Collections.emptyList());

						List<FinalMenuSetDTO> categoryRecipes = recipeMasterList.stream().map(type -> {
							FinalMenuSetDTO rdto = new FinalMenuSetDTO();
							rdto.setRecipeFk(type.getId());
							rdto.setRecipeName(type.getRecipeName());
							rdto.setPerPortionCost(type.getPerPortionCost());
							rdto.setPortionSize(type.getPortionSize());
							return rdto;
						}).toList();

						for (MealSetMenuDHib selected : selectedForCategory) {
							FinalMenuSetDTO detailDTO = new FinalMenuSetDTO();
							detailDTO.setCategoryFk(categoryFk);
							detailDTO.setCategoryName(selected.getCategoryName());
							detailDTO.setMenuFk(hib1.getId());
							detailDTO.setMealTypeFk(hib1.getMealTypeFk());
							detailDTO.setRecipeCount(selectedForCategory.size());
							detailDTO.setCategoryNameList(categoryRecipes);

							// Selected recipe details
							detailDTO.setRecipeFk(selected.getRecipeFk());
							detailDTO.setPerPortionCost(selected.getPerPortionCost());
							detailDTO.setPortionSize(selected.getPortionSize());

							detailDTO.setRecipes(categoryRecipes);
							detailList.add(detailDTO);
						}
					}

					dto.setDetailList(detailList);
					response.setData(dto);
					response.setSuccess(AppConstants.TRUE);
					response.setMessage(AppConstants.MSG_RECORD_FETCHED);

					LOGGER.info("meal set menu Details fetched successfully for ID: {}", id);
				}
			}

		} catch (RestException re) {
			LOGGER.warn(AppConstants.REST_EXCEPTION + " final menu set not found with Header ID: {}", id, re);
			response.setSuccess(AppConstants.FALSE);
			response.setMessage(AppConstants.REST_EXCEPTION);
		} catch (Exception e) {
			response.setSuccess(AppConstants.FALSE);
			response.setMessage(AppConstants.EXCEPTION);
			LOGGER.error(AppConstants.EXCEPTION + " final menu set fetch by Header ID", e);
		}

		LOGGER.info("Final menu set view process completed for Header ID: {}", id);
		return response;
	}

	public ResponseDTO<FinalMenuSetDTO> modifyFinalMenuSet(FinalMenuSetDTO dto) {
		ResponseDTO<FinalMenuSetDTO> response = new ResponseDTO<>();

		if (dto == null || dto.getSelectedMeals() == null) {
			return buildErrorResponse(response, "Invalid data");
		}

		try {
			Optional<FinalSetMenuMHib> masterOpt = finalSetMenuMRepository.findById(dto.getId());
			if (masterOpt.isEmpty()) {
				return buildErrorResponse(response, "Master record not found");
			}

			FinalSetMenuMHib master = masterOpt.get();
			updateMaster(master, dto);

			List<FinalSetMenuHHib> existingMenus = finalSetMenuHRepository
					.findActiveHeadersByFinalMenuFk(master.getId());

			// Remove headers no longer selected
			existingMenus.forEach(existing -> {
				boolean stillExists = dto.getSelectedMeals().stream()
						.anyMatch(m -> m.getFinalMenuFk() == existing.getFinalMenuFk());

				if (!stillExists) {
					deleteHeaderCascade(existing);
				}
			});

			// Save or update selected headers
			for (FinalMenuSetDTO headerDTO : dto.getSelectedMeals()) {
				FinalSetMenuHHib header = headerDTO.getId() != 0
						? finalSetMenuHRepository.findHeadersByMenuFk(dto.getId(), headerDTO.getMenuFk())
						: createHeaderEntity(dto, headerDTO);

				if (header != null) {
					updateHeader(header, headerDTO, dto.getLastActBy());
					saveHeader(header, headerDTO, dto.getId(), dto.getLastActBy());
				}
			}

			response.setSuccess(true);
			response.setMessage("Final Menu Set updated successfully");
			response.setData(dto);

		} catch (Exception e) {
			response.setSuccess(false);
			response.setMessage("Error: " + e.getMessage());
			LOGGER.error("Error updating Final Menu Set", e);
		}

		return response;
	}

	// ================= Helper Methods =================

	private ResponseDTO<FinalMenuSetDTO> buildErrorResponse(ResponseDTO<FinalMenuSetDTO> response, String message) {
		response.setSuccess(false);
		response.setMessage(message);
		return response;
	}

	private void updateMaster(FinalSetMenuMHib master, FinalMenuSetDTO dto) {
		master.setName(dto.getMenuSetName().trim().toUpperCase());
		master.setNotes(dto.getNotes());
		master.setTotal(dto.getTotalCost());
		master.setTotalRecipeCount(dto.getTotalRecipeCount());
		master.setLastActBy(dto.getLastActBy());
		master.setLastActDateTime(new Date());
		finalSetMenuMRepository.save(master);
	}

	private void deleteHeaderCascade(FinalSetMenuHHib header) {

		// Delete header
		finalSetMenuHRepository.delete(header);

		// Delete only D table of this finalMenuFk
		List<FinalSetMenuDHib> details = finalSetMenuDRepository
				.findActiveDetailsByFinalMenuFk(header.getFinalMenuFk());

		for (FinalSetMenuDHib d : details) {
			finalSetMenuDRepository.delete(d);

			// Delete ingredients for this detail only
			finalSetMenuIRepository.findActiveItemsByMenuDFk(d.getId()).forEach(finalSetMenuIRepository::delete);
		}
	}

	private FinalSetMenuHHib createHeaderEntity(FinalMenuSetDTO dto, FinalMenuSetDTO headerDTO) {
		Optional<MealSetMenuHHib> headerOpt = mealSetMenuHRepository.findById(headerDTO.getMenuFk());
		if (headerOpt.isEmpty()) {
			return null;
		}

		MealSetMenuHHib header = headerOpt.get();
		FinalSetMenuHHib menuH = new FinalSetMenuHHib();
		menuH.setFinalMenuFk(dto.getId());
		menuH.setMealTypeFk(header.getMealTypeFk());
		menuH.setMenuFk(headerDTO.getMenuFk());
		menuH.setMealTypeName(header.getMealTypeName());
		menuH.setTemplateFk(header.getTemplateFk());
		menuH.setTemplateName(header.getTemplateName());
		menuH.setMenuName(header.getMenuName());
		menuH.setCategoryCount(headerDTO.getCategoryCount());
		menuH.setRecipeCount(headerDTO.getRecipeCount());
		menuH.setTotalCost(headerDTO.getCost());
		menuH.setStatus(AppConstants.FLAG_A);
		menuH.setApprovalStatus(APPROVAL_STATUS_DRAFT);
		menuH.setCreatedBy(dto.getLastActBy());
		menuH.setCreatedDateTime(new Date());
		menuH.setLastActBy(dto.getLastActBy());
		menuH.setLastActDateTime(new Date());
		return menuH;
	}

	private void updateHeader(FinalSetMenuHHib header, FinalMenuSetDTO dto, int lastActBy) {
		header.setStatus(AppConstants.FLAG_A);
		header.setRecipeCount(dto.getRecipeCount());
		header.setTotalCost(dto.getCost());
		header.setLastActBy(lastActBy);
		header.setCategoryCount(dto.getCategoryCount());
		header.setLastActDateTime(new Date());
	}

	private void saveHeader(FinalSetMenuHHib header, FinalMenuSetDTO headerDTO, int finalMenuId, int lastActBy) {
		finalSetMenuHRepository.save(header);

		if (headerDTO.getDetailList() != null && !headerDTO.getDetailList().isEmpty()) {
			for (FinalMenuSetDTO recipeDTO : headerDTO.getDetailList()) {
				saveOrUpdateRecipe(header, recipeDTO, finalMenuId, lastActBy);
			}
		}
	}

	private void saveOrUpdateRecipe(FinalSetMenuHHib header, FinalMenuSetDTO recipeDTO, int finalMenuId,
			int lastActBy) {
		FinalSetMenuDHib recipe = finalSetMenuDRepository.findByFinalFkMenuFkAndRecipeFk(finalMenuId,
				header.getMenuFk(), recipeDTO.getRecipeFk());

		if (recipe != null) {
			recipe.setStatus(AppConstants.FLAG_A);
			recipe.setLastActBy(lastActBy);
			recipe.setLastActDateTime(new Date());
			finalSetMenuDRepository.save(recipe);
		} else {
			recipeHRepository.findById(recipeDTO.getRecipeFk()).ifPresent(rh -> {
				FinalSetMenuDHib newRecipe = new FinalSetMenuDHib();
				newRecipe.setMenuFk(header.getMenuFk());
				newRecipe.setFinalMenuFk(finalMenuId);
				newRecipe.setCategoryFk(recipeDTO.getCategoryFk());
				newRecipe.setCategoryName(recipeDTO.getCategoryName());
				newRecipe.setRecipeFk(rh.getId());
				newRecipe.setRecipeName(rh.getRecipeName());
				newRecipe.setUniqueNo(rh.getUniqueNo());
				newRecipe.setRefNo(rh.getRefNo());
				newRecipe.setStatus(AppConstants.FLAG_A);
				newRecipe.setCreatedBy(lastActBy);
				newRecipe.setCreatedDateTime(new Date());
				newRecipe.setLastActBy(lastActBy);
				newRecipe.setLastActDateTime(new Date());
				finalSetMenuDRepository.save(newRecipe);

				saveIngredients(newRecipe, finalMenuId, header.getMenuFk(), lastActBy);
			});
		}
	}

	private void saveIngredients(FinalSetMenuDHib recipe, int finalMenuId, int menuFk, int lastActBy) {
		List<RecipeDHib> items = recipeDRepository.findByActRecipe(recipe.getRecipeFk());
		for (RecipeDHib item : items) {
			FinalSetMenuIHib ing = new FinalSetMenuIHib();
			ing.setMenuFk(menuFk);
			ing.setMenuDFk(recipe.getId());
			ing.setFinalMenuFk(finalMenuId);
			ing.setRecipeFk(recipe.getRecipeFk());
			ing.setCategoryFk(item.getCategoryFk());
			ing.setCategoryName(item.getCategoryName());
			ing.setItemFk(item.getItemFk());
			ing.setItemName(item.getItemName());
			ing.setStatus(AppConstants.FLAG_A);
			ing.setCreatedBy(lastActBy);
			ing.setCreatedDateTime(new Date());
			ing.setLastActBy(lastActBy);
			ing.setLastActDateTime(new Date());
			finalSetMenuIRepository.save(ing);
		}
	}

	public ResponseDTO<FinalMenuSetDTO> copyFinalMenuSet(FinalMenuSetDTO dto) {

		ResponseDTO<FinalMenuSetDTO> response = new ResponseDTO<>();

		try {

			if (dto == null || dto.getId() == 0) {
				response.setSuccess(AppConstants.FALSE);
				response.setMessage("Empty data");
				return response;
			}

			// ============================
			// 1. Load Original Master Menu
			// ============================
			Optional<FinalSetMenuMHib> existingOpt = finalSetMenuMRepository.findById(dto.getId());

			if (existingOpt.isEmpty()) {
				response.setSuccess(AppConstants.FALSE);
				response.setMessage("Master menu not found");
				return response;
			}

			FinalSetMenuMHib original = existingOpt.get();

			// ============================
			// 2. Create New Master Record
			// ============================
			FinalSetMenuMHib newMaster = new FinalSetMenuMHib();

			newMaster.setName(dto.getNewMenuName().trim().toUpperCase());
			newMaster.setNotes(original.getNotes());
			newMaster.setTotal(original.getTotal());
			newMaster.setTotalRecipeCount(original.getTotalRecipeCount());
			newMaster.setApprovedBy(original.getCreatedBy());
			newMaster.setApprovalStatus(APPROVAL_STATUS_DRAFT);
			newMaster.setMealTypeFk(original.getMealTypeFk());
			newMaster.setStatus(AppConstants.FLAG_A);
			newMaster.setCreatedBy(dto.getCreatedBy());
			newMaster.setCreatedDateTime(new Date());
			newMaster.setLastActBy(dto.getCreatedBy());
			newMaster.setLastActDateTime(new Date());

			newMaster = finalSetMenuMRepository.save(newMaster);

			int finalFk = newMaster.getId();

			// ============================
			// 3. COPY HEADER RECORDS
			// ============================
			List<FinalSetMenuHHib> headers = finalSetMenuHRepository.findByMenuDFk(dto.getId());

			if (headers != null && !headers.isEmpty()) {
				for (FinalSetMenuHHib h : headers) {

					FinalSetMenuHHib copyH = new FinalSetMenuHHib();
					copyH.setFinalMenuFk(finalFk);
					copyH.setMealTypeFk(h.getMealTypeFk());
					copyH.setMealTypeName(h.getMealTypeName());
					copyH.setTemplateFk(h.getTemplateFk());
					copyH.setMenuFk(h.getMenuFk());
					copyH.setTemplateName(h.getTemplateName());
					copyH.setMenuName(h.getMenuName());
					copyH.setCategoryCount(h.getCategoryCount());
					copyH.setRecipeCount(h.getRecipeCount());
					copyH.setTotalCost(h.getTotalCost());
					copyH.setStatus(AppConstants.FLAG_A);
					copyH.setApprovalStatus(APPROVAL_STATUS_DRAFT);
					copyH.setApprovedBy(dto.getCreatedBy());
					copyH.setCreatedBy(dto.getCreatedBy());
					copyH.setCreatedDateTime(new Date());
					copyH.setLastActBy(dto.getCreatedBy());
					copyH.setLastActDateTime(new Date());

					finalSetMenuHRepository.save(copyH);
				}
			} else {
				response.setSuccess(AppConstants.FALSE);
				response.setMessage("No header records found");
				return response;
			}

			// ============================
			// 4. COPY DETAIL RECORDS
			// ============================
			List<FinalSetMenuDHib> details = finalSetMenuDRepository.findByAct(dto.getId());

			if (details != null && !details.isEmpty()) {
				for (FinalSetMenuDHib d : details) {

					FinalSetMenuDHib copyD = new FinalSetMenuDHib();

					copyD.setFinalMenuFk(finalFk);
					copyD.setMenuFk(d.getMenuFk());
					copyD.setRecipeName(d.getRecipeName());
					copyD.setCategoryFk(d.getCategoryFk());
					copyD.setCategoryName(d.getCategoryName());
					copyD.setRecipeFk(d.getRecipeFk());
					copyD.setUniqueNo(d.getUniqueNo());
					copyD.setRefNo(d.getRefNo());
					copyD.setCookingInstruction(d.getCookingInstruction());
					copyD.setCountryOriginFk(d.getCountryOriginFk());
					copyD.setBaseQuantityFk(d.getBaseQuantityFk());
					copyD.setBaseQuantity(d.getBaseQuantity());
					copyD.setUom(d.getUom());
					copyD.setFinishedProduct(d.getFinishedProduct());
					copyD.setPortionSize(d.getPortionSize());
					copyD.setImageUrl(d.getImageUrl());
					copyD.setTotalCost(d.getTotalCost());
					copyD.setPerPortionCost(d.getPerPortionCost());
					copyD.setStatus(AppConstants.FLAG_A);
					copyD.setCreatedBy(dto.getCreatedBy());
					copyD.setCreatedDateTime(new Date());
					copyD.setLastActBy(dto.getCreatedBy());
					copyD.setLastActDateTime(new Date());

					copyD = finalSetMenuDRepository.save(copyD);

					// ==================================
					// 5. COPY INGREDIENTS FOR THIS DETAIL
					// ==================================
					List<FinalSetMenuIHib> ingredients = finalSetMenuIRepository.findActiveItemsByMenuDFk(d.getId());

					if (ingredients != null && !ingredients.isEmpty()) {
						for (FinalSetMenuIHib ing : ingredients) {

							FinalSetMenuIHib item = new FinalSetMenuIHib();

							item.setFinalMenuFk(finalFk);
							item.setMenuFk(ing.getMenuFk());
							item.setMenuDFk(copyD.getId());
							item.setRecipeFk(ing.getRecipeFk());
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
							item.setBaseQuantity(ing.getBaseQuantity());
							item.setSecondaryQuantity(ing.getSecondaryQuantity());
							item.setTotal(ing.getTotal());
							item.setStatus(AppConstants.FLAG_A);
							item.setCreatedBy(dto.getCreatedBy());
							item.setCreatedDateTime(new Date());
							item.setLastActBy(dto.getCreatedBy());
							item.setLastActDateTime(new Date());

							finalSetMenuIRepository.save(item);
						}
					}
				}
			}

			response.setSuccess(AppConstants.TRUE);
			response.setMessage(AppConstants.MSG_RECORD_COPY);

		} catch (Exception e) {
			response.setSuccess(AppConstants.FALSE);
			response.setMessage(AppConstants.EXCEPTION);
			LOGGER.error(AppConstants.EXCEPTION + " not saved", e);
		}

		return response;
	}

	public ResponseDTO<List<ComboBoxDTO>> loadMealSetTemplateDropDown(int mealTypeFk) {
		ResponseDTO<List<ComboBoxDTO>> response = new ResponseDTO<>();
		List<ComboBoxDTO> comboList = new ArrayList<>();
		try {
			List<MealSetTemplateHHib> mealMASTERHIB = mealSetTemplateHRepository.findByMealTypeStatus(mealTypeFk);
			if (mealMASTERHIB != null && !mealMASTERHIB.isEmpty()) {
				for (MealSetTemplateHHib hib : mealMASTERHIB) {
					ComboBoxDTO dto = new ComboBoxDTO();
					dto.setPk(hib.getId());
					dto.setName(hib.getTemplateName());

					comboList.add(dto);
				}
				response.setSuccess(AppConstants.TRUE);
			} else {
				response.setSuccess(AppConstants.FALSE);
				response.setMessage(AppConstants.E_DATA);
			}
			response.setData(comboList);
		} catch (RestException re) {
			response.setSuccess(AppConstants.FALSE);
			LOGGER.warn(AppConstants.REST_EXCEPTION + "Recipe Meal Name", re);
		} catch (Exception e) {
			response.setSuccess(AppConstants.FALSE);
			LOGGER.error(AppConstants.EXCEPTION + " Recipe Meal Name", e);
		}
		return response;
	}

	public ResponseDTO<List<ComboBoxDTO>> loadCategoryByTemplatePkDropDown(int templatefk) {
		ResponseDTO<List<ComboBoxDTO>> response = new ResponseDTO<>();
		List<ComboBoxDTO> comboList = new ArrayList<>();
		try {
			List<MealSetTemplateDHib> hIB = mealSetTemplateDRepository.findByActCat(templatefk);
			if (null != hIB && !hIB.isEmpty()) {
				for (MealSetTemplateDHib d_hib : hIB) {
					Optional<MstCategoryMasterHib> mSTCATEGORYMASTERHIB1 = mstCategoryMasterRepository
							.findById(d_hib.getCategoryFk());
					if (mSTCATEGORYMASTERHIB1.isPresent()) {
						MstCategoryMasterHib mSTCATEGORYMASTERHIB = mSTCATEGORYMASTERHIB1.get();
						ComboBoxDTO dto = new ComboBoxDTO();
						dto.setPk(mSTCATEGORYMASTERHIB.getId());
						dto.setName(mSTCATEGORYMASTERHIB.getCategoryName());
						dto.setCode(mSTCATEGORYMASTERHIB.getCategoryCode());
						comboList.add(dto);
					} else {
						response.setSuccess(AppConstants.FALSE);
						response.setMessage(AppConstants.E_DATA);
					}
				}

			} else {
				response.setSuccess(AppConstants.FALSE);
				response.setMessage(AppConstants.E_DATA);
			}

			response.setData(comboList);
		} catch (RestException re) {
			response.setSuccess(AppConstants.FALSE);
			LOGGER.warn(AppConstants.REST_EXCEPTION + "Item Category List", re);
		} catch (Exception e) {
			response.setSuccess(AppConstants.FALSE);
			LOGGER.error(AppConstants.EXCEPTION + "Item Category List", e);
		}
		return response;
	}

	public ResponseEntity<byte[]> printexcelreportView(int id, int userId) {

		try {
			ResponseDTO<FinalMenuSetDTO> response = finalMenuView(id);

			if (!isValidResponse(response)) {
				LOGGER.info("No data found for this Id");
				return ResponseEntity.status(HttpStatus.NO_CONTENT).body(null);
			}

			FinalMenuSetDTO dto = response.getData();

			if (isEmptyDetail(dto)) {
				return ResponseEntity.status(HttpStatus.NOT_FOUND)
						.body(("No records found for menu ID: " + id).getBytes());
			}

			try (HSSFWorkbook workbook = new HSSFWorkbook()) {
				HSSFSheet sheet = workbook.createSheet("Final Menu Details");

				Styles styles = createStyles(workbook);

				writeHeaderSection(sheet, dto, userId, styles);

				double grandTotal = writeDataRows(sheet, dto, styles);

				writeGrandTotal(sheet, grandTotal, styles);

				byte[] bytes = toBytes(workbook);

				HttpHeaders headers = new HttpHeaders();
				headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
				headers.set(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=MenuDetailsReport.xls");

				return new ResponseEntity<>(bytes, headers, HttpStatus.OK);
			}
		} catch (Exception e) {
			LOGGER.error("Error generating Excel", e);
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
					.body(("Error generating Excel: " + e.getMessage()).getBytes());
		}
	}

	private boolean isValidResponse(ResponseDTO<FinalMenuSetDTO> response) {
		return response != null && response.isSuccess() && response.getData() != null;
	}

	private boolean isEmptyDetail(FinalMenuSetDTO dto) {
		return dto == null || dto.getDetailList() == null || dto.getDetailList().isEmpty();
	}

	private static class Styles {
		private final HSSFCellStyle generatedBy;
		private final HSSFCellStyle left;
		private final HSSFCellStyle right;
		private final HSSFCellStyle total;

		private Styles(HSSFCellStyle generatedBy, HSSFCellStyle left, HSSFCellStyle right, HSSFCellStyle total) {
			this.generatedBy = generatedBy;
			this.left = left;
			this.right = right;
			this.total = total;
		}
	}

	private Styles createStyles(HSSFWorkbook workbook) {

		HSSFFont boldBlack = workbook.createFont();
		boldBlack.setBold(true);
		boldBlack.setColor(IndexedColors.BLACK.getIndex());

		HSSFFont boldBlue = workbook.createFont();
		boldBlue.setBold(true);
		boldBlue.setColor(IndexedColors.BLUE.getIndex());

		// Header
		HSSFCellStyle generatedByStyle = workbook.createCellStyle();
		generatedByStyle.setAlignment(HorizontalAlignment.CENTER);
		generatedByStyle.setBorderBottom(BorderStyle.THICK);
		generatedByStyle.setBorderTop(BorderStyle.THICK);
		generatedByStyle.setBorderLeft(BorderStyle.THICK);
		generatedByStyle.setBorderRight(BorderStyle.THICK);
		generatedByStyle.setFont(boldBlue);

		// Left text
		HSSFCellStyle leftStyle = workbook.createCellStyle();
		leftStyle.setAlignment(HorizontalAlignment.LEFT);
		leftStyle.setBorderBottom(BorderStyle.THICK);
		leftStyle.setBorderTop(BorderStyle.THICK);
		leftStyle.setBorderLeft(BorderStyle.THICK);
		leftStyle.setBorderRight(BorderStyle.THICK);
		leftStyle.setFont(boldBlack);

		// Right alignment
		HSSFCellStyle rightStyle = workbook.createCellStyle();
		rightStyle.setAlignment(HorizontalAlignment.RIGHT);
		rightStyle.setBorderBottom(BorderStyle.THICK);
		rightStyle.setBorderTop(BorderStyle.THICK);
		rightStyle.setBorderLeft(BorderStyle.THICK);
		rightStyle.setBorderRight(BorderStyle.THICK);

		// Totals
		HSSFCellStyle totalStyle = workbook.createCellStyle();
		totalStyle.setAlignment(HorizontalAlignment.CENTER);
		totalStyle.setBorderBottom(BorderStyle.THICK);
		totalStyle.setBorderTop(BorderStyle.THICK);
		totalStyle.setBorderLeft(BorderStyle.THICK);
		totalStyle.setBorderRight(BorderStyle.THICK);
		totalStyle.setWrapText(true);
		totalStyle.setFont(boldBlack);

		return new Styles(generatedByStyle, leftStyle, rightStyle, totalStyle);
	}

	private void writeHeaderSection(HSSFSheet sheet, FinalMenuSetDTO dto, int userId, Styles styles) {

		SimpleDateFormat sdf = new SimpleDateFormat("dd-MM-yyyy");

		HSSFRow titleRow = sheet.createRow(0);
		Cell titleCell = titleRow.createCell(3);
		titleCell.setCellValue("Final Menu Set Report");
		titleCell.setCellStyle(styles.generatedBy);

		HSSFRow infoRow = sheet.createRow(1);
		infoRow.createCell(0).setCellValue("Menu Name:");
		infoRow.getCell(0).setCellStyle(styles.generatedBy);
		infoRow.createCell(1).setCellValue(dto.getFinalMenuName());
		infoRow.getCell(1).setCellStyle(styles.left);

		infoRow.createCell(2).setCellValue("Generated Date:");
		infoRow.getCell(2).setCellStyle(styles.generatedBy);
		infoRow.createCell(3).setCellValue(sdf.format(new Date()));
		infoRow.getCell(3).setCellStyle(styles.left);

		HSSFRow userRow = sheet.createRow(2);
		userRow.createCell(0).setCellValue("Generated By:");
		userRow.getCell(0).setCellStyle(styles.generatedBy);
		userRow.createCell(1).setCellValue(getApproverName(userId));
		userRow.getCell(1).setCellStyle(styles.left);

		userRow.createCell(2).setCellValue("Total Recipes:");
		userRow.getCell(2).setCellStyle(styles.generatedBy);
		userRow.createCell(3).setCellValue(dto.getRecipeCount());
		userRow.getCell(3).setCellStyle(styles.left);
	}

	private double writeDataRows(HSSFSheet sheet, FinalMenuSetDTO dto, Styles styles) {

		int row = 5;
		int sno = 1;
		double grandTotal = 0;

		HSSFRow header = sheet.createRow(row);

		String[] headers = { "S.No", "Type", "Category", "Recipe Name", "IDEAL POR", "PER PORTION COST" };

		for (int i = 0; i < headers.length; i++) {
			Cell c = header.createCell(i);
			c.setCellValue(headers[i]);
			c.setCellStyle(styles.total);
		}

		for (FinalMenuSetDTO d : dto.getDetailList()) {

			ResponseDTO<FinalMenuSetDTO> view = finalMenuSetViewByMenu(dto.getId(), d.getMenuFk());
			FinalMenuSetDTO viewDto = view.getData();

			int startRow = row + 1;
			double subtotal = 0.0;

			for (FinalMenuSetDTO cat : viewDto.getCategoryList()) {
				for (FinalMenuSetDTO r : cat.getRecipes()) {

					row++;
					HSSFRow data = sheet.createRow(row);

					data.createCell(0).setCellValue(sno++);
					data.getCell(0).setCellStyle(styles.left);

					data.createCell(1).setCellValue(viewDto.getMealType());
					data.getCell(1).setCellStyle(styles.left);

					data.createCell(2).setCellValue(cat.getCategoriesName());
					data.getCell(2).setCellStyle(styles.left);

					data.createCell(3).setCellValue(r.getRecipeName());
					data.getCell(3).setCellStyle(styles.left);

					data.createCell(4).setCellValue(
							r.getPerPortionSize() + " " + (r.getUom() == null ? EMPTY_STRING : r.getUom()));
					data.getCell(4).setCellStyle(styles.right);

					data.createCell(5).setCellValue(r.getRecipeCost());
					data.getCell(5).setCellStyle(styles.right);

					subtotal += r.getRecipeCost();
				}
			}

			if (row > startRow) {
				sheet.addMergedRegion(new CellRangeAddress(startRow, row, 1, 1));
			}

			row++;
			HSSFRow sub = sheet.createRow(row);
			sub.createCell(4).setCellValue("Subtotal");
			sub.getCell(4).setCellStyle(styles.total);
			sub.createCell(5).setCellValue(subtotal);
			sub.getCell(5).setCellStyle(styles.total);

			grandTotal += subtotal;
		}

		return grandTotal;
	}

	private void writeGrandTotal(HSSFSheet sheet, double total, Styles styles) {

		int lastRow = sheet.getLastRowNum() + 1;

		HSSFRow row = sheet.createRow(lastRow);

		row.createCell(4).setCellValue("Grand Total");
		row.getCell(4).setCellStyle(styles.total);

		row.createCell(5).setCellValue(total);
		row.getCell(5).setCellStyle(styles.total);
	}

	private byte[] toBytes(HSSFWorkbook workbook) throws IOException {
		ByteArrayOutputStream out = new ByteArrayOutputStream();
		workbook.write(out);
		workbook.close();
		return out.toByteArray();
	}

	public ResponseEntity<byte[]> printexcelreport(FinalMenuSetDTO finalMenuSetDTO) {

		try {
			LOGGER.info("Method get called");

			ResponseDTO<FinalMenuSetDTO> response = finalMenuList(finalMenuSetDTO);

			if (!isValidMenuListResponse(response)) {
				return ResponseEntity.status(HttpStatus.NO_CONTENT).body(null);
			}

			FinalMenuSetDTO data = response.getData();
			List<FinalMenuSetDTO> menus = data.getFinalSetMenuList();

			if (menus == null || menus.isEmpty()) {
				return ResponseEntity.status(HttpStatus.NO_CONTENT).body(null);
			}

			try (HSSFWorkbook workbook = new HSSFWorkbook()) {
				HSSFSheet sheet = workbook.createSheet("FinalMenuSet");

				SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");

				Styles1 styles = createStyles1(workbook);

				writeReportHeader(sheet, data, styles, sdf);

				writeTableHeader(sheet, styles);

				writeTableData(sheet, menus, sdf);

				byte[] bytes = convertToBytes(workbook);

				return buildDownloadResponse(bytes);
			}

		} catch (Exception e) {
			LOGGER.error("Exception in printexcelreport: {}", e.getMessage(), e);
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
		}
	}

	private boolean isValidMenuListResponse(ResponseDTO<FinalMenuSetDTO> response) {
		return response != null && response.isSuccess() && response.getData() != null
				&& response.getData().getFinalSetMenuList() != null;
	}

	private static class Styles1 {
		private final CellStyle header;
		private final CellStyle total;
		private final CellStyle normal;

		private Styles1(CellStyle header, CellStyle total, CellStyle normal) {
			this.header = header;
			this.total = total;
			this.normal = normal;

		}
	}

	private Styles1 createStyles1(HSSFWorkbook workbook) {

		// header bold blue
		CellStyle headerStyle = workbook.createCellStyle();
		headerStyle.setBorderBottom(BorderStyle.THIN);
		headerStyle.setBorderTop(BorderStyle.THIN);
		headerStyle.setBorderLeft(BorderStyle.THIN);
		headerStyle.setBorderRight(BorderStyle.THIN);

		Font headerFont = workbook.createFont();
		headerFont.setBold(true);
		headerFont.setColor(IndexedColors.BLUE.getIndex());
		headerStyle.setFont(headerFont);

		// total/bold
		CellStyle totalStyle = workbook.createCellStyle();
		totalStyle.setAlignment(HorizontalAlignment.CENTER);
		totalStyle.setBorderBottom(BorderStyle.THIN);
		totalStyle.setBorderTop(BorderStyle.THIN);
		totalStyle.setBorderLeft(BorderStyle.THIN);
		totalStyle.setBorderRight(BorderStyle.THIN);

		Font totalFont = workbook.createFont();
		totalFont.setBold(true);
		totalStyle.setFont(totalFont);

		// normal
		CellStyle normalStyle = workbook.createCellStyle();
		normalStyle.setBorderBottom(BorderStyle.THIN);
		normalStyle.setBorderTop(BorderStyle.THIN);
		normalStyle.setBorderLeft(BorderStyle.THIN);
		normalStyle.setBorderRight(BorderStyle.THIN);

		// date
		CellStyle dateStyle = workbook.createCellStyle();
		dateStyle.cloneStyleFrom(normalStyle);

		return new Styles1(headerStyle, totalStyle, normalStyle);
	}

	private void writeReportHeader(HSSFSheet sheet, FinalMenuSetDTO dto, Styles1 styles, SimpleDateFormat sdf) {

		HSSFRow r1 = sheet.createRow(0);
		r1.createCell(3).setCellValue("Final Menu Set Report");
		r1.getCell(3).setCellStyle(styles.header);

		HSSFRow r2 = sheet.createRow(1);
		r2.createCell(0).setCellValue("Generated By:");
		r2.getCell(0).setCellStyle(styles.header);

		r2.createCell(1).setCellValue(dto.getUserName());
		r2.getCell(1).setCellStyle(styles.normal);

		r2.createCell(2).setCellValue("Generated Date:");
		r2.getCell(2).setCellStyle(styles.header);

		r2.createCell(3).setCellValue(sdf.format(new Date()));
		r2.getCell(3).setCellStyle(styles.normal);

		HSSFRow r3 = sheet.createRow(2);

		r3.createCell(0).setCellValue("Active Menu:");
		r3.getCell(0).setCellStyle(styles.header);

		r3.createCell(1).setCellValue(dto.getActiveMenu());
		r3.getCell(1).setCellStyle(styles.normal);

		r3.createCell(2).setCellValue("Total Menu:");
		r3.getCell(2).setCellStyle(styles.header);

		r3.createCell(3).setCellValue(dto.getTotalMenu());
		r3.getCell(3).setCellStyle(styles.normal);
	}

	private void writeTableHeader(HSSFSheet sheet, Styles1 styles) {

		int rowIndex = 5;
		HSSFRow row = sheet.createRow(rowIndex);

		String[] headers = { "S.No", "Final Name", "Created By", "Approver By", "Total Recipes", "Total Cost",
				"Created Date", "Updated Date", "Approval Status", "Status", "Menu Names" };

		for (int i = 0; i < headers.length; i++) {
			Cell c = row.createCell(i);
			c.setCellValue(headers[i]);
			c.setCellStyle(styles.total);
			sheet.setColumnWidth(i, 5000);
		}
	}

	private void writeTableData(HSSFSheet sheet, List<FinalMenuSetDTO> menus, SimpleDateFormat sdf) {

		int rowIndex = 6;
		int sno = 1;

		for (FinalMenuSetDTO obj : menus) {

			HSSFRow row = sheet.createRow(rowIndex++);

			int col = 0;

			row.createCell(col++).setCellValue(sno++); // S.No
			row.createCell(col++).setCellValue(nvl(obj.getFinalMenuName()));
			row.createCell(col++).setCellValue(nvl(obj.getUserName()));
			row.createCell(col++).setCellValue(nvl(obj.getApprover()));
			row.createCell(col++).setCellValue(obj.getRecipeCount());
			row.createCell(col++).setCellValue(obj.getTotalCost());

			row.createCell(col++)
					.setCellValue(obj.getCreatedDate() != null ? sdf.format(obj.getCreatedDate()) : EMPTY_STRING);
			row.createCell(col++)
					.setCellValue(obj.getUpdatedDate() != null ? sdf.format(obj.getUpdatedDate()) : EMPTY_STRING);

			row.createCell(col++).setCellValue(nvl(obj.getApprovalStatusStr()));
			row.createCell(col++).setCellValue(nvl(obj.getStatusStr()));

			String menuNames = buildMenuNames(obj);
			row.createCell(col).setCellValue(menuNames);
		}
	}

	private String buildMenuNames(FinalMenuSetDTO dto) {

		if (dto.getDetailList() == null) {
			return "No Menu";
		}

		return dto.getDetailList().stream().filter(Objects::nonNull)
				.map(d -> nvl(d.getMealTypeName()) + " - " + nvl(d.getMenuName())).collect(Collectors.joining(", "));
	}

	private String nvl(String v) {
		return v == null ? EMPTY_STRING : v;
	}

	private byte[] convertToBytes(HSSFWorkbook workbook) throws IOException {
		ByteArrayOutputStream out = new ByteArrayOutputStream();
		workbook.write(out);
		workbook.close();
		return out.toByteArray();
	}

	private ResponseEntity<byte[]> buildDownloadResponse(byte[] bytes) {

		HttpHeaders headers = new HttpHeaders();
		headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
		headers.set(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=FinalMenuSet.xls");

		return new ResponseEntity<>(bytes, headers, HttpStatus.OK);
	}
}