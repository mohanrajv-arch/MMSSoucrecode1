package esfita.service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.math.BigDecimal;
import java.math.BigInteger;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Date;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.function.Function;
import java.util.function.ToIntFunction;
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
import esfita.dto.MealSetTemplateDTO;
import esfita.dto.ResponseDTO;
import esfita.entity.MealSetTemplateDHib;
import esfita.entity.MealSetTemplateHHib;
import esfita.entity.MstCategoryMasterHib;
import esfita.entity.RecipeMealMasterHib;
import esfita.repository.MealSetTemplateDRepository;
import esfita.repository.MealSetTemplateHRepository;
import esfita.repository.MstCategoryMasterRepository;
import esfita.repository.MstUserRepository;
import esfita.repository.RecipeMealMasterRepository;
import esfita.utils.AppConstants;
import esfita.utils.RestException;
import lombok.extern.log4j.Log4j2;

@Service
@Log4j2
public class MealSetTemplateService {
	private static final Logger log = LoggerFactory.getLogger(MealSetTemplateService.class);
	private final MealSetTemplateHRepository mealSetTemplateHRepository;
	private final MealSetTemplateDRepository mealSetTemplateDRepository;
	private final MstUserRepository mstUserRepository;
	private final RecipeMealMasterRepository recipeMealMasterRepository;
	private final MstCategoryMasterRepository mstCategoryMasterRepository;

	// Constructor injection
	public MealSetTemplateService(MealSetTemplateHRepository mealSetTemplateHRepository,
			MealSetTemplateDRepository mealSetTemplateDRepository, MstUserRepository mstUserRepository,
			RecipeMealMasterRepository recipeMealMasterRepository,
			MstCategoryMasterRepository mstCategoryMasterRepository) {
		this.mealSetTemplateHRepository = mealSetTemplateHRepository;
		this.mealSetTemplateDRepository = mealSetTemplateDRepository;
		this.mstUserRepository = mstUserRepository;
		this.recipeMealMasterRepository = recipeMealMasterRepository;
		this.mstCategoryMasterRepository = mstCategoryMasterRepository;
	}

	public ResponseDTO<List<ComboBoxDTO>> loadMealTypeDropDown() {
		try {
			return buildComboResponse(recipeMealMasterRepository.orderBy(), RecipeMealMasterHib::getId,
					RecipeMealMasterHib::getRecipeMealName, RecipeMealMasterHib::getRecipeMealCode);
		} catch (Exception e) {
			return buildComboResponse(Collections.emptyList(), x -> 0, x -> "", x -> "");
		}
	}

	public ResponseDTO<List<ComboBoxDTO>> loadCategoryDropDown() {
		try {
			return buildComboResponse(mstCategoryMasterRepository.orderBy(), MstCategoryMasterHib::getId,
					MstCategoryMasterHib::getCategoryName, MstCategoryMasterHib::getCategoryCode);
		} catch (Exception e) {
			return buildComboResponse(Collections.emptyList(), x -> 0, x -> "", x -> "");
		}
	}

	public ResponseDTO<MealSetTemplateDTO> mealSetViewById(int id) {
		ResponseDTO<MealSetTemplateDTO> response = new ResponseDTO<>();

		try {
			Optional<MealSetTemplateHHib> templateOpt = mealSetTemplateHRepository.findById(id);

			if (templateOpt.isEmpty()) {
				response.setSuccess(AppConstants.FALSE);
				response.setMessage(AppConstants.EMPTY_LIST + "Meal Set Template ID: " + id);
				log.warn("Meal Set Template not found for ID: {}", id);
				return response;
			}

			MealSetTemplateHHib hib = templateOpt.get();
			MealSetTemplateDTO dto = mapTemplateToDTO(hib);

			List<MealSetTemplateDHib> catList = mealSetTemplateDRepository.findByActCat(hib.getId());
			dto.setCategoryList(mapCategoryList(catList, dto.getTotalRecipes()));

			response.setData(dto);
			response.setSuccess(AppConstants.TRUE);
			response.setMessage(AppConstants.MSG_RECORD_FETCHED);
			log.info("<----Meal Set Template fetched successfully for ID: {}--->", id);

		} catch (Exception e) {
			return handleSaveException(e, response);
		}

		return response;
	}

	private MealSetTemplateDTO mapTemplateToDTO(MealSetTemplateHHib hib) {
		MealSetTemplateDTO dto = new MealSetTemplateDTO();
		dto.setId(hib.getId());
		dto.setMealTypeFk(hib.getMealTypeFk());
		dto.setMealType(hib.getMealTypeName());
		dto.setTemplateName(hib.getTemplateName());
		dto.setApprovalStatus(hib.getApprovalStatus());
		dto.setApprovalStatusStr(mapApprovalStatus(hib.getApprovalStatus()));
		dto.setCreatedDate(hib.getCreatedDateTime());
		dto.setTotalCategories(hib.getNoCategories());
		dto.setUserName(getApproverName(hib.getCreatedBy()));
		dto.setTotalRecipes(hib.getNoRecipes());
		dto.setApprover(getApproverName(hib.getApprovedBy()));
		return dto;
	}

	private String mapApprovalStatus(Integer status) {
		if (status == null) {
			return "Unknown";
		}
		return switch (status) {
		case 3 -> "Draft";
		case 0 -> "Approved";
		case 1 -> "Pending";
		case 2 -> "Rejected";
		default -> "Unknown";
		};
	}

	private String getApproverName(Integer approverId) {
		if (approverId == null)
			return "";
		return mstUserRepository.findById(approverId).map(u -> u.getFirstName()).orElse("");
	}

	private List<MealSetTemplateDTO> mapCategoryList(List<MealSetTemplateDHib> catList, int totalRecipes) {
		if (catList == null || catList.isEmpty())
			return Collections.emptyList();

		return catList.stream().filter(Objects::nonNull).map(hibD -> {
			MealSetTemplateDTO ddto = new MealSetTemplateDTO();
			ddto.setCategoryFk(hibD.getCategoryFk());
			ddto.setId(hibD.getId());
			ddto.setCategoriesName(hibD.getCategoryName());
			ddto.setTotalRecipes(hibD.getRecipesRequired());

			int percentage = 0;
			if (totalRecipes > 0) {
				percentage = (int) Math.round((hibD.getRecipesRequired() * 100.0) / totalRecipes);
			}
			ddto.setRecipePercentage(percentage);
			return ddto;
		}).toList();
	}

	public ResponseDTO<MealSetTemplateDTO> mealSetTemplateList(MealSetTemplateDTO filterDTO) {
		ResponseDTO<MealSetTemplateDTO> response = new ResponseDTO<>();
		MealSetTemplateDTO summaryDTO = new MealSetTemplateDTO();

		try {
			List<MealSetTemplateHHib> templates = mealSetTemplateHRepository
					.findByMealTypeAndApprovalStatus(filterDTO.getMealTypeFk(), filterDTO.getApprovalStatus());

			if (templates == null || templates.isEmpty()) {
				return buildEmptyResponse(response);
			}

			List<MealSetTemplateDTO> templateDTOs = buildTemplateDTOList(templates);
			summaryDTO.setMealSetTemplateList(templateDTOs);
			summaryDTO.setCreatedBy(filterDTO.getCreatedBy());
			populateSummaryData(summaryDTO);

			response.setData(summaryDTO);
			response.setSuccess(AppConstants.TRUE);
			response.setMessage(AppConstants.MSG_RECORD_FETCHED);

			log.info("<----Meal Set Template Details fetched successfully, count: {} --->", templateDTOs.size());
		} catch (Exception e) {
			return handleSaveException(e, response);
		}

		return response;
	}

	public List<MealSetTemplateDTO> buildTemplateDTOList(List<MealSetTemplateHHib> templates) {
		List<MealSetTemplateDTO> dtoList = new ArrayList<>();
		for (MealSetTemplateHHib hib : templates) {
			MealSetTemplateDTO dto = mapToTemplateDTO(hib);
			List<MealSetTemplateDTO> categoryList = fetchCategoryList(hib.getId());
			dto.setCategoryList(categoryList);
			dtoList.add(dto);
		}

		// store totalCategories in a static context or via return wrapper if needed
		return dtoList;
	}

	private MealSetTemplateDTO mapToTemplateDTO(MealSetTemplateHHib hib) {
		MealSetTemplateDTO dto = new MealSetTemplateDTO();
		dto.setId(hib.getId());
		dto.setTemplateName(hib.getTemplateName());
		dto.setMealType(hib.getMealTypeName());
		dto.setTotalCategories(hib.getNoCategories());
		dto.setTotalRecipes(hib.getNoRecipes());
		dto.setCreatedDate(hib.getCreatedDateTime());
		dto.setStatus(hib.getStatus());
		dto.setApprovalStatus(hib.getApprovalStatus());
		dto.setApprover(getApproverName(hib.getApprovedBy()));
		dto.setCreatedDate(hib.getCreatedDateTime());
		dto.setUpdatedDate(hib.getLastActDateTime());
		dto.setUserName(getApproverName(hib.getCreatedBy()));
		dto.setStatusStr(hib.getStatus() == AppConstants.FLAG_A ? AppConstants.ACTIVE : AppConstants.INACTIVE);
		dto.setApprovalStatusStr(mapApprovalStatus(hib.getApprovalStatus()));

		return dto;
	}

	private List<MealSetTemplateDTO> fetchCategoryList(Integer templateId) {
		List<MealSetTemplateDTO> categories = new ArrayList<>();
		List<MealSetTemplateDHib> categoryHibs = mealSetTemplateDRepository.findByActCat(templateId);

		if (categoryHibs == null)
			return categories;

		for (MealSetTemplateDHib hibD : categoryHibs) {
			MealSetTemplateDTO catDTO = new MealSetTemplateDTO();
			catDTO.setCategoriesName(hibD.getCategoryName() + " (" + hibD.getRecipesRequired() + ")");
			categories.add(catDTO);
		}
		return categories;
	}

	public void populateSummaryData(MealSetTemplateDTO dto) {
		try {
			List<Object[]> summaryList = mealSetTemplateHRepository.getTemplateSummaryByMealType();

			int totalTemplates = 0;
			int totalActiveTemplates = 0;
			int totalMealTypes = 0;
			int totalCategories = 0; // use double to store sum of average categories
			List<Object> mealList = new ArrayList<>();

			for (Object[] row : summaryList) {
				String mealTypeName = getSafeStringValue(row[0]);

				// Safe casting for numeric values
				int templateCount = getSafeIntValue(row[1]);
				int activeTemplateCount = getSafeIntValue(row[2]);
				int mealTypeCount = getSafeIntValue(row[3]);
				int avgCat = getSafeIntValue(row[4]); // use double for AVG column

				totalTemplates += templateCount;
				totalActiveTemplates += activeTemplateCount;
				totalMealTypes += mealTypeCount;
				totalCategories += avgCat; // sum of averages

				if (mealTypeName != null) {
					mealList.add(mealTypeName);
				}
			}

			// Compute average categories per template safely
			int avgCategories = 0;

			if (totalTemplates > 0) {
				avgCategories = totalCategories / totalTemplates;
			}

			// Helper method to safely convert Object to double

			dto.setMealList(mealList);
			dto.setTotalTemplate(totalTemplates);
			dto.setActiveTemplate(totalActiveTemplates);
			dto.setMealTypeCount(totalMealTypes);
			dto.setAvgCategories(avgCategories);
			dto.setApprover(getApproverName(dto.getCreatedBy()));

		} catch (Exception e) {
			log.error("Error in populateSummaryData", e);
			// Set default values in case of error
			dto.setMealList(new ArrayList<>());
			dto.setTotalTemplate(0);
			dto.setActiveTemplate(0);
			dto.setMealTypeCount(0);
			dto.setAvgCategories(0.0);
		}
	}

	// Helper method for safe string conversion
	private String getSafeStringValue(Object value) {
		if (value == null) {
			return null;
		}
		return value.toString();
	}

	// Helper method for safe integer conversion
	private int getSafeIntValue(Object value) {
		if (value == null) {
			return 0;
		}

		try {
			if (value instanceof BigInteger biginteger) {
				return biginteger.intValue();
			} else if (value instanceof Long longVal) {
				return longVal.intValue();
			} else if (value instanceof Integer integerVal) {
				return integerVal;
			} else if (value instanceof BigDecimal bigdecimal) {
				return bigdecimal.intValue();
			} else if (value instanceof Number number) {
				return number.intValue();
			} else {
				// Try to parse as string
				return Integer.parseInt(value.toString());
			}
		} catch (Exception e) {
			log.warn("Error converting value to int: {}", value, e);
			return 0;
		}
	}

	private ResponseDTO<MealSetTemplateDTO> buildEmptyResponse(ResponseDTO<MealSetTemplateDTO> response) {
		response.setSuccess(AppConstants.FALSE);
		response.setMessage(AppConstants.EMPTY_DATA);
		return response;
	}

	public ResponseDTO<MealSetTemplateDTO> mealSetStatusUpdate(MealSetTemplateDTO dto) {
		ResponseDTO<MealSetTemplateDTO> response = new ResponseDTO<>();
		try {
			if (null != dto && 0 != dto.getId()) {

				Optional<MealSetTemplateHHib> hibOpt = mealSetTemplateHRepository.findById(dto.getId());
				if (hibOpt.isPresent()) {
					MealSetTemplateHHib hib = hibOpt.get();
					char status = Character.toUpperCase(dto.getStatus());

					if (status == AppConstants.FLAG_A) {
						hib.setStatus(AppConstants.FLAG_A);
						response.setMessage(AppConstants.ACTIVATED);
					} else if (status == AppConstants.FLAG_I) {
						hib.setStatus(AppConstants.FLAG_I);
						response.setMessage(AppConstants.INACTIVATED);
					}

					mealSetTemplateHRepository.save(hib);
					response.setSuccess(true);
				} else {
					response.setSuccess(false);
					response.setMessage(AppConstants.EMPTY_DATA);
				}
			} else {
				response.setSuccess(false);
				response.setMessage(AppConstants.EMPTY_DATA);
			}
		} catch (Exception e) {
			return handleSaveException(e, response);
		}

		return response;
	}

	public ResponseDTO<MealSetTemplateDTO> saveMealSetTemplate(MealSetTemplateDTO dto) {
		ResponseDTO<MealSetTemplateDTO> response = new ResponseDTO<>();
		try {
			if (null != dto) {
				// Validate required data
				if (dto.getSubList() == null || dto.getSubList().isEmpty()) {
					response.setSuccess(AppConstants.FALSE);
					response.setMessage(AppConstants.EMPTY_LIST);
					return response; // Return early
				}

				if (dto.getTemplateName() == null || dto.getTemplateName().trim().isEmpty()) {
					response.setSuccess(AppConstants.FALSE);
					response.setMessage("Template name is required");
					return response;
				}

				if (dto.getMealTypeFk() == null || dto.getMealTypeFk() == 0) {
					response.setSuccess(AppConstants.FALSE);
					response.setMessage("Meal type is required");
					return response;
				}

				// Save header
				MealSetTemplateHHib hib = new MealSetTemplateHHib();
				hib.setMealTypeFk(dto.getMealTypeFk());
				hib.setMealTypeName(dto.getMealType());
				hib.setNoCategories(dto.getTotalCategories());
				hib.setNoRecipes(dto.getTotalRecipes());
				hib.setTemplateName(dto.getTemplateName());
				hib.setStatus(AppConstants.FLAG_A);
				hib.setApprovalStatus(3);
				hib.setApprovedBy(dto.getApproverBy());
				hib.setCreatedBy(dto.getApproverBy());
				hib.setCreatedDateTime(new Date());
				hib.setLastActBy(dto.getApproverBy());
				hib.setLastActDateTime(new Date());

				mealSetTemplateHRepository.save(hib);

				// Save details
				for (MealSetTemplateDTO ddto : dto.getSubList()) {
					MealSetTemplateDHib hib1 = new MealSetTemplateDHib();
					hib1.setCategoryFk(ddto.getCategoryFk());
					hib1.setCategoryName(ddto.getCategoriesName());
					hib1.setRecipesRequired(ddto.getTotalRecipes());
					hib1.setTemplateFk(hib.getId());
					hib1.setStatus(AppConstants.FLAG_A);
					hib1.setCreatedBy(dto.getApproverBy());
					hib1.setCreatedDateTime(new Date());
					hib1.setLastActBy(dto.getApproverBy());
					hib1.setLastActDateTime(new Date());
					mealSetTemplateDRepository.save(hib1);
				}

				response.setMessage(AppConstants.MSG_RECORD_CREATED);
				response.setSuccess(AppConstants.TRUE);
			} else {
				response.setSuccess(AppConstants.FALSE);
				response.setMessage(AppConstants.EMPTY_DATA);
			}
		} catch (Exception e) {
			return handleSaveException(e, response);
		}
		return response;
	}

	public ResponseDTO<MealSetTemplateDTO> modifyMealSetTemplate(MealSetTemplateDTO dto) {
		ResponseDTO<MealSetTemplateDTO> response = new ResponseDTO<>();

		if (dto == null) {
			return buildFailureResponse(response, AppConstants.EMPTY_DATA); // Invalid input
		}

		try {
			Optional<MealSetTemplateHHib> hibOpt = mealSetTemplateHRepository.findById(dto.getId());

			if (hibOpt.isEmpty()) {
				log.warn("Meal Set Template not found with ID: {}", dto.getId());
				return buildFailureResponse(response, AppConstants.EMPTY_DATA);
			}

			MealSetTemplateHHib hib = hibOpt.get();

			// Update header
			updateHeader(hib, dto);
			mealSetTemplateHRepository.save(hib);

			// Sync detail records using extracted method
			boolean syncSuccess = safeSyncDetailRecords(hib.getId(), dto);
			if (!syncSuccess) {
				return buildFailureResponse(response, AppConstants.DATA_EXCEPTION_SAVE);
			}

			response.setSuccess(AppConstants.TRUE);
			response.setMessage(AppConstants.MSG_RECORD_UPDATED);
			response.setData(dto);

			log.info("Meal Set Template modified successfully for ID: {}", hib.getId());

		} catch (Exception e) {
			return handleSaveException(e, response);
		}

		return response;
	}

	private boolean safeSyncDetailRecords(Integer templateId, MealSetTemplateDTO dto) {
		try {
			syncDetailRecords(templateId, dto);
			return true;
		} catch (Exception e) {
			log.error("Error syncing Meal Set Template details for ID: {}", templateId, e);
			return false;
		}
	}

	public void updateHeader(MealSetTemplateHHib hib, MealSetTemplateDTO dto) {
		hib.setMealTypeFk(dto.getMealTypeFk());
		hib.setMealTypeName(dto.getMealType());
		hib.setNoCategories(dto.getTotalCategories());
		hib.setNoRecipes(dto.getTotalRecipes());
		hib.setTemplateName(dto.getTemplateName());
		hib.setApprovalStatus(dto.getApprovalStatus());
		hib.setLastActBy(dto.getApproverBy());
		hib.setLastActDateTime(new Date());
	}

	public void syncDetailRecords(Integer templateId, MealSetTemplateDTO dto) {
		List<MealSetTemplateDHib> existingRecords = Optional
				.ofNullable(mealSetTemplateDRepository.findByTemplateFk(templateId)).orElse(Collections.emptyList());

		Map<Integer, MealSetTemplateDHib> existingMap = existingRecords.stream()
				.collect(Collectors.toMap(MealSetTemplateDHib::getCategoryFk, r -> r));

		Set<Integer> processedIds = new HashSet<>();

		if (dto.getSubList() != null) {
			for (MealSetTemplateDTO ddto : dto.getSubList()) {

				MealSetTemplateDHib record1 = existingMap.getOrDefault(ddto.getCategoryFk(), new MealSetTemplateDHib());

				// 👉 FIXED null-safe check
				boolean isNew = record1.getId() == 0;

				record1.setCategoryFk(ddto.getCategoryFk());
				record1.setCategoryName(ddto.getCategoriesName());
				record1.setRecipesRequired(ddto.getTotalRecipes());
				record1.setTemplateFk(templateId);
				record1.setStatus(AppConstants.FLAG_A);
				record1.setLastActBy(dto.getApproverBy());
				record1.setLastActDateTime(new Date());

				if (isNew) {
					record1.setCreatedBy(dto.getApproverBy());
					record1.setCreatedDateTime(new Date());
				}

				mealSetTemplateDRepository.save(record1);
				processedIds.add(ddto.getCategoryFk());
			}
		}

		// Inactivate records not in DTO
		existingRecords.stream()
				.filter(r -> !processedIds.contains(r.getCategoryFk()) && r.getStatus() == AppConstants.FLAG_A)
				.forEach(r -> {
					r.setStatus(AppConstants.FLAG_I);
					r.setLastActBy(dto.getApproverBy());
					r.setLastActDateTime(new Date());
					mealSetTemplateDRepository.save(r);
				});
	}

	private ResponseDTO<MealSetTemplateDTO> buildFailureResponse(ResponseDTO<MealSetTemplateDTO> response, String msg) {
		response.setSuccess(AppConstants.FALSE);
		response.setMessage(msg);
		return response;
	}

	public ResponseDTO<MealSetTemplateDTO> modifyViewById(int id) {
		ResponseDTO<MealSetTemplateDTO> response = new ResponseDTO<>();

		List<MealSetTemplateDTO> categoryList = new ArrayList<>();

		try {
			Optional<MealSetTemplateHHib> hibOpt = mealSetTemplateHRepository.findById(id);
			if (hibOpt.isPresent()) {
				MealSetTemplateHHib hib = hibOpt.get();

				MealSetTemplateDTO dto = new MealSetTemplateDTO();

				dto.setId(hib.getId());
				dto.setMealTypeFk(hib.getMealTypeFk());
				dto.setMealType(dto.getMealType());
				dto.setTemplateName(hib.getTemplateName());

				dto.setApprovalStatus(hib.getApprovalStatus());
				dto.setTotalCategories(hib.getNoCategories());
				dto.setTotalRecipes(hib.getNoRecipes());
				dto.setApproverBy(hib.getApprovedBy());
				List<MealSetTemplateDHib> catList = mealSetTemplateDRepository.findByActCat(hib.getId());
				if (null != catList && !catList.isEmpty()) {
					for (MealSetTemplateDHib hibD : catList) {

						MealSetTemplateDTO ddto = new MealSetTemplateDTO();
						ddto.setCategoryFk(hibD.getCategoryFk());
						ddto.setId(hibD.getId());
						ddto.setCategoriesName(hibD.getCategoryName());
						ddto.setTotalRecipes(hibD.getRecipesRequired());

						categoryList.add(ddto);
					}
				}
				dto.setSubList(categoryList);

				response.setData(dto);
				response.setSuccess(AppConstants.TRUE);
				response.setMessage(AppConstants.MSG_RECORD_FETCHED);

			} else {
				response.setSuccess(AppConstants.FALSE);
				response.setMessage(AppConstants.EMPTY_LIST + "Meal Set Template not found for ID: " + id);
				log.warn("Meal Set Template for ID: {}", id);

			}
		} catch (Exception e) {
			return handleSaveException(e, response);
		}

		return response;
	}

	public ResponseDTO<MealSetTemplateDTO> saveMealSetTemplateCopy(MealSetTemplateDTO dto) {

		ResponseDTO<MealSetTemplateDTO> response = new ResponseDTO<>();

		try {

			if (dto == null) {
				return failure(response, AppConstants.EMPTY_DATA);
			}

			Optional<MealSetTemplateHHib> existingOpt = mealSetTemplateHRepository.findById(dto.getId());

			if (existingOpt.isEmpty()) {
				return failure(response, "Template not found");
			}

			MealSetTemplateHHib existing = existingOpt.get();

			MealSetTemplateHHib savedHeader = copyHeader(existing, dto);

			List<MealSetTemplateDHib> details = mealSetTemplateDRepository.findByTemplateHId(existing.getId());

			if (details == null || details.isEmpty()) {
				return failure(response, AppConstants.EMPTY_LIST);
			}

			copyDetails(details, savedHeader.getId(), dto.getApproverBy());

			response.setSuccess(AppConstants.TRUE);
			response.setMessage(AppConstants.MSG_RECORD_COPY);

		} catch (Exception e) {
			return handleSaveException(e, response);
		}

		return response;
	}

	private MealSetTemplateHHib copyHeader(MealSetTemplateHHib existing, MealSetTemplateDTO dto) {

		MealSetTemplateHHib newTemplate = new MealSetTemplateHHib();
		Date now = new Date();

		newTemplate.setMealTypeFk(existing.getMealTypeFk());
		newTemplate.setMealTypeName(existing.getMealTypeName());
		newTemplate.setNoCategories(existing.getNoCategories());
		newTemplate.setNoRecipes(existing.getNoRecipes());
		newTemplate.setTemplateName(dto.getNewTemplateName());
		newTemplate.setStatus(AppConstants.FLAG_A);
		newTemplate.setApprovalStatus(3);
		newTemplate.setApprovedBy(dto.getApproverBy());
		newTemplate.setCreatedBy(dto.getApproverBy());
		newTemplate.setCreatedDateTime(now);
		newTemplate.setLastActBy(dto.getApproverBy());
		newTemplate.setLastActDateTime(now);

		return mealSetTemplateHRepository.save(newTemplate);
	}

	private void copyDetails(List<MealSetTemplateDHib> details, Integer newHeaderId, Integer userId) {

		Date now = new Date();

		for (MealSetTemplateDHib d : details) {

			MealSetTemplateDHib nd = new MealSetTemplateDHib();

			nd.setCategoryFk(d.getCategoryFk());
			nd.setCategoryName(d.getCategoryName());
			nd.setRecipesRequired(d.getRecipesRequired());
			nd.setTemplateFk(newHeaderId);
			nd.setStatus(AppConstants.FLAG_A);
			nd.setCreatedBy(userId);
			nd.setCreatedDateTime(now);
			nd.setLastActBy(userId);
			nd.setLastActDateTime(now);

			mealSetTemplateDRepository.save(nd);
		}
	}

	private ResponseDTO<MealSetTemplateDTO> failure(ResponseDTO<MealSetTemplateDTO> r, String msg) {
		r.setSuccess(AppConstants.FALSE);
		r.setMessage(msg);
		return r;
	}

	public ResponseDTO<MealSetTemplateDTO> saveApprovalStatus(MealSetTemplateDTO dto) {
		ResponseDTO<MealSetTemplateDTO> response = new ResponseDTO<>();

		try {
			if (dto != null) {
				Optional<MealSetTemplateHHib> existingTemplate = mealSetTemplateHRepository.findById(dto.getId());

				if (existingTemplate.isPresent()) {
					MealSetTemplateHHib hib = existingTemplate.get();
					hib.setApprovalStatus(dto.getApprovalStatus());
					hib.setApprovedBy(dto.getApproverBy());

					hib.setLastActBy(dto.getApproverBy());
					hib.setLastActDateTime(new Date());

					mealSetTemplateHRepository.save(hib);
					response.setSuccess(AppConstants.TRUE);
					response.setMessage(AppConstants.APPROVAL_STATUS);

				} else {
					response.setSuccess(AppConstants.FALSE);
					response.setMessage(AppConstants.EMPTY_LIST);
				}
			} else {
				response.setSuccess(AppConstants.FALSE);
				response.setMessage(AppConstants.EMPTY_DATA); // Input data is null
			}

		} catch (Exception e) {
			return handleSaveException(e, response);
		}

		return response;
	}

// List Excel
	public ResponseEntity<byte[]> exportMealSetTemplateExcel(MealSetTemplateDTO filterDTO) {
		try {
			ResponseDTO<MealSetTemplateDTO> response = mealSetTemplateList(filterDTO);
			MealSetTemplateDTO summaryDTO = response.getData();

			// Check if data is empty - return empty Excel instead of 204
			if (summaryDTO == null || summaryDTO.getMealSetTemplateList() == null
					|| summaryDTO.getMealSetTemplateList().isEmpty()) {
				return createEmptyExcelResponse();
			}

			try (Workbook workbook = new HSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {

				// Create styles
				CellStyle headerStyle = createHeaderStyle(workbook);
				CellStyle boldStyle = createBoldStyle(workbook);
				CellStyle stringStyle = createStringStyle(workbook);
				CellStyle dateStyle = createDateStyle(workbook);
				CellStyle centerStyle = createCenterStyle(workbook);

				// Create sheet
				createMealSetTemplateSheet(workbook, headerStyle, boldStyle, stringStyle, dateStyle, centerStyle,
						summaryDTO);

				// Write to stream
				workbook.write(out);
				byte[] excelBytes = out.toByteArray();

				return createSuccessResponse(excelBytes);
			}
		} catch (Exception e) {
			log.error("Error while exporting Meal Set Template Excel", e);
			return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	// Create empty Excel when no data found
	private ResponseEntity<byte[]> createEmptyExcelResponse() throws IOException {
		try (Workbook workbook = new HSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {

			Sheet sheet = workbook.createSheet("No Data");

			// Create message
			Row row = sheet.createRow(0);
			Cell cell = row.createCell(0);
			cell.setCellValue("No meal set templates found for the given criteria");

			// Auto-size column
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
				"MealSetTemplateReport_" + new SimpleDateFormat("yyyyMMddHHmmss").format(new Date()) + ".xls");

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
		style.setBorderBottom(BorderStyle.THIN);
		style.setBorderTop(BorderStyle.THIN);
		style.setBorderLeft(BorderStyle.THIN);
		style.setBorderRight(BorderStyle.THIN);
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

	private CellStyle createDateStyle(Workbook workbook) {
		CellStyle style = workbook.createCellStyle();
		style.setBorderBottom(BorderStyle.THIN);
		style.setBorderTop(BorderStyle.THIN);
		style.setBorderLeft(BorderStyle.THIN);
		style.setBorderRight(BorderStyle.THIN);
		style.setAlignment(HorizontalAlignment.CENTER);
		style.setDataFormat(workbook.createDataFormat().getFormat("yyyy-mm-dd hh:mm:ss"));
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

	// ======================
	// Single Sheet Creation - FIXED VERSION
	// ======================
	private void createMealSetTemplateSheet(Workbook workbook, CellStyle headerStyle, CellStyle boldStyle,
			CellStyle stringStyle, CellStyle dateStyle, CellStyle centerStyle, MealSetTemplateDTO summaryDTO) {

		Sheet sheet = workbook.createSheet("Meal Set Templates");
		int rowNum = 0;
		SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");

// Top Summary Section
		rowNum = writeTitle(sheet, rowNum, boldStyle);
		rowNum = writeGeneratedInfo(sheet, rowNum, boldStyle, stringStyle, sdf, summaryDTO);
		rowNum++; // spacing row

// Header Row
		String[] headers = buildHeaders();
		writeHeaderRow(sheet, rowNum++, headers, headerStyle);

// Data rows
		writeDataRows(sheet, rowNum, summaryDTO, centerStyle, stringStyle, dateStyle, sdf);

// Auto-size all columns
		autoSize(sheet, headers.length);
	}

	private int writeTitle(Sheet sheet, int rowNum, CellStyle boldStyle) {
		Row titleRow = sheet.createRow(rowNum++);
		Cell titleCell = titleRow.createCell(3);
		titleCell.setCellValue("Meal Set Template Report");
		titleCell.setCellStyle(boldStyle);
		return rowNum;
	}

	private int writeGeneratedInfo(Sheet sheet, int rowNum, CellStyle boldStyle, CellStyle stringStyle,
			SimpleDateFormat sdf, MealSetTemplateDTO dto) {

		rowNum = labelValue(sheet, rowNum, "Generated Date:", boldStyle, sdf.format(new Date()), stringStyle);
		rowNum = labelValue(sheet, rowNum, "Generated By:", boldStyle, dto.getApprover(), stringStyle);
		rowNum = labelValue(sheet, rowNum, "Total Template:", boldStyle, dto.getTotalTemplate(), stringStyle);
		rowNum = labelValue(sheet, rowNum, "Active Template:", boldStyle, dto.getActiveTemplate(), stringStyle);

		int inactive = dto.getTotalTemplate() - dto.getActiveTemplate();
		rowNum = labelValue(sheet, rowNum, "InActive Template:", boldStyle, inactive, stringStyle);

		return rowNum;
	}

	private int labelValue(Sheet sheet, int rowNum, String label, CellStyle labelStyle, Object value,
			CellStyle valueStyle) {

		Row row = sheet.createRow(rowNum++);

		Cell l = row.createCell(0);
		l.setCellValue(label);
		l.setCellStyle(labelStyle);

		Cell v = row.createCell(1);
		v.setCellStyle(valueStyle);
		v.setCellValue(value == null ? "" : value.toString());

		return rowNum;
	}

	private String[] buildHeaders() {
		return new String[] { "S.No", "Template Id", "Template Name", "Meal Type", "Total Categories", "Total Recipes",
				"Approval Status", "Created By", "Approver", "Created Date", "Updated Date", "Status" };
	}

	private void writeHeaderRow(Sheet sheet, int rowNum, String[] headers, CellStyle style) {
		Row headerRow = sheet.createRow(rowNum);
		for (int i = 0; i < headers.length; i++) {
			Cell c = headerRow.createCell(i);
			c.setCellValue(headers[i]);
			c.setCellStyle(style);
		}
	}

	private void writeDataRows(Sheet sheet, int rowNum, MealSetTemplateDTO summaryDTO, CellStyle center,
			CellStyle string, CellStyle dateStyle, SimpleDateFormat sdf) {

		if (summaryDTO.getMealSetTemplateList() == null) {
			return;
		}

		int serialNo = 1;

		for (MealSetTemplateDTO t : summaryDTO.getMealSetTemplateList()) {

			Row row = sheet.createRow(rowNum++);

			writeNumber(row, 0, serialNo++, center);
			writeNumber(row, 1, t.getId(), center);

			writeText(row, 2, t.getTemplateName(), string);
			writeText(row, 3, t.getMealType(), string);

			writeNumber(row, 4, t.getTotalCategories(), center);
			writeNumber(row, 5, t.getTotalRecipes(), center);

			writeText(row, 6, t.getApprovalStatusStr(), string);
			writeText(row, 7, t.getUserName(), string);
			writeText(row, 8, t.getApprover(), string);

			writeDate(row, 9, t.getCreatedDate(), dateStyle, sdf);
			writeDate(row, 10, t.getUpdatedDate(), string, sdf);

			writeText(row, 11, t.getStatusStr(), string);
		}
	}

	private void writeText(Row row, int col, String value, CellStyle style) {
		Cell c = row.createCell(col);
		c.setCellStyle(style);
		c.setCellValue(value == null ? "" : value);
	}

	private void writeNumber(Row row, int col, Integer value, CellStyle style) {
		Cell c = row.createCell(col);
		c.setCellStyle(style);
		if (value != null)
			c.setCellValue(value);
	}

	private void writeDate(Row row, int col, Date value, CellStyle style, SimpleDateFormat sdf) {
		Cell c = row.createCell(col);
		c.setCellStyle(style);
		c.setCellValue(value == null ? "" : sdf.format(value));
	}

	private void autoSize(Sheet sheet, int count) {
		for (int i = 0; i < count; i++) {
			sheet.autoSizeColumn(i);
		}
	}

	String username1 = null;

// View Excel
	public ResponseEntity<byte[]> exportMealSetTemplateDetailExcel(int templateId, int userId) {
		try {
			// Fetch template data using existing service method
			ResponseDTO<MealSetTemplateDTO> response = mealSetViewById(templateId);
			MealSetTemplateDTO templateDTO = response.getData();

			// Check if data is available
			if (templateDTO == null || templateDTO.getCategoryList() == null
					|| templateDTO.getCategoryList().isEmpty()) {
				return createEmptyExcelResponse("No template data available for export");

			}

			try (Workbook workbook = new HSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {

				// Create styles
				CellStyle titleStyle = createTitleStyle(workbook);
				CellStyle boldStyle = createBoldStyle(workbook);
				CellStyle stringStyle = createStringStyle(workbook);
				CellStyle centerStyle = createCenterStyle(workbook);
				CellStyle headerStyle = createHeaderStyle(workbook);

				username1 = getApproverName(userId);

				// Create sheet with detailed template data
				createMealSetTemplateDetailSheet(workbook, headerStyle, titleStyle, boldStyle, stringStyle, centerStyle,
						templateDTO);

				// Write to stream
				workbook.write(out);
				byte[] excelBytes = out.toByteArray();
				return createSuccessResponse(excelBytes, templateDTO.getTemplateName());

			}
		} catch (Exception e) {
			log.error("Error exporting meal set template detail Excel for ID: {}", templateId, e);
			return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	// Create empty Excel when no data found
	private ResponseEntity<byte[]> createEmptyExcelResponse(String message) throws IOException {
		try (Workbook workbook = new HSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {

			Sheet sheet = workbook.createSheet("No Data");
			Row row = sheet.createRow(0);
			Cell cell = row.createCell(0);
			cell.setCellValue(message);
			sheet.autoSizeColumn(0);

			workbook.write(out);
			byte[] excelBytes = out.toByteArray();

			return new ResponseEntity<>(excelBytes, HttpStatus.OK);

		}
	}

	// Create success response with headers
	private ResponseEntity<byte[]> createSuccessResponse(byte[] excelBytes, String templateName) {
		HttpHeaders headers = new HttpHeaders();
		headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
		String fileName = (templateName != null ? templateName : "Meal_Template_Detail") + "_"
				+ new SimpleDateFormat("yyyyMMddHHmmss").format(new Date()) + ".xls";
		headers.setContentDispositionFormData("attachment", fileName);

		return new ResponseEntity<>(excelBytes, headers, HttpStatus.OK);
	}

	// ======================
	// Additional Styles for Detailed Report
	// ======================
	private CellStyle createTitleStyle(Workbook workbook) {
		CellStyle style = workbook.createCellStyle();
		Font font = workbook.createFont();
		font.setBold(true);
		font.setColor(IndexedColors.BLACK.getIndex());
		style.setFont(font);
		style.setAlignment(HorizontalAlignment.CENTER);
		return style;
	}

	private void createMealSetTemplateDetailSheet(Workbook workbook, CellStyle headerStyle, CellStyle titleStyle,
			CellStyle boldStyle, CellStyle stringStyle, CellStyle centerStyle, MealSetTemplateDTO templateDTO) {

		SimpleDateFormat sdf = new SimpleDateFormat("dd-MM-yyyy");
		Sheet sheet = workbook.createSheet(templateDTO.getTemplateName());
		int rowNum = 0;

		// Title Row
		Row titleRow = sheet.createRow(rowNum++);
		Cell titleCell = titleRow.createCell(0);
		titleCell.setCellValue(templateDTO.getTemplateName());
		titleCell.setCellStyle(titleStyle);
		sheet.addMergedRegion(new CellRangeAddress(0, 0, 0, 4));

		// Empty row
		rowNum++;

		Row summaryRow = sheet.createRow(rowNum++);
		Cell summaryCell = summaryRow.createCell(2);
		summaryCell.setCellValue("Summary");
		summaryCell.setCellStyle(titleStyle);

		// Meal Type and Summary Section
		Row mealTypeRow = sheet.createRow(rowNum++);
		createLabelValuePair(mealTypeRow, 0, "Meal Type:",
				templateDTO.getMealType() != null ? templateDTO.getMealType() : "", boldStyle, stringStyle);

		createLabelValuePair(mealTypeRow, 2, "Created By :", templateDTO.getUserName(), boldStyle, stringStyle);
		summaryCell.setCellStyle(titleStyle);

		// Approval Status and Total Categories
		Row approvalRow = sheet.createRow(rowNum++);
		createLabelValuePair(approvalRow, 0, "Approval Status:", templateDTO.getApprovalStatusStr(), boldStyle,
				stringStyle);

		createLabelValuePair(approvalRow, 2, "Total Categories:", String.valueOf(templateDTO.getCategoryList().size()),
				boldStyle, stringStyle);

		// Approver and Total Recipes Required
		Row approverRow = sheet.createRow(rowNum++);
		createLabelValuePair(approverRow, 0, "Approver:",
				templateDTO.getApprover() != null ? templateDTO.getApprover() : "N/A", boldStyle, stringStyle);

		int totalRecipes = templateDTO.getCategoryList().stream()
				.mapToInt(item -> item.getTotalRecipes() != 0 ? item.getTotalRecipes() : 0).sum();
		createLabelValuePair(approverRow, 2, "Total Recipes Required:", String.valueOf(totalRecipes), boldStyle,
				stringStyle);

		// Created and Template ID
		Row createdRow = sheet.createRow(rowNum++);
		createLabelValuePair(createdRow, 0, "Created:",
				templateDTO.getCreatedDate() != null ? sdf.format(templateDTO.getCreatedDate())
						: sdf.format(new Date()),
				boldStyle, stringStyle);

		createLabelValuePair(createdRow, 2, "Template ID:",
				templateDTO.getId() != 0 ? String.valueOf(templateDTO.getId()) : "3", boldStyle, stringStyle);

		Row genaratedRow = sheet.createRow(rowNum++);
		createLabelValuePair(genaratedRow, 0, "Generated By :", username1, boldStyle, stringStyle);

		createLabelValuePair(genaratedRow, 2, "Generated Date :", sdf.format(new Date()), boldStyle, stringStyle);

		// Empty row
		rowNum++;

		// Category Requirements Title
		Row categoryTitleRow = sheet.createRow(rowNum++);
		Cell categoryTitleCell = categoryTitleRow.createCell(0);
		categoryTitleCell.setCellValue("Category Requirements");
		categoryTitleCell.setCellStyle(titleStyle);
		sheet.addMergedRegion(new CellRangeAddress(rowNum - 1, rowNum - 1, 0, 4));

		// Empty row
		rowNum++;

		// Category Table Headers
		String[] categoryHeaders = { "Sr. No", "Category Name", "Recipes Required", "Percentage" };
		Row headerRow = sheet.createRow(rowNum++);
		for (int i = 0; i < categoryHeaders.length; i++) {
			Cell cell = headerRow.createCell(i);
			cell.setCellValue(categoryHeaders[i]);
			cell.setCellStyle(headerStyle);
		}

		// Category Data Rows
		int serialNo = 1;
		for (MealSetTemplateDTO category : templateDTO.getCategoryList()) {
			Row row = sheet.createRow(rowNum++);

			// Serial Number
			Cell serialCell = row.createCell(0);
			serialCell.setCellValue(serialNo++);
			serialCell.setCellStyle(centerStyle);

			// Category Name
			Cell nameCell = row.createCell(1);
			nameCell.setCellValue(category.getCategoriesName() != null ? category.getCategoriesName() : "N/A");
			nameCell.setCellStyle(stringStyle);

			// Recipes Required
			Cell recipesCell = row.createCell(2);
			recipesCell.setCellValue(String.valueOf(category.getTotalRecipes()));
			recipesCell.setCellStyle(centerStyle);

			// Percentage
			Cell percentageCell = row.createCell(3);
			percentageCell.setCellValue(category.getRecipePercentage() + "%");
			percentageCell.setCellStyle(centerStyle);
		}

		// Set column widths
		sheet.setColumnWidth(0, 8000); // Sr. No
		sheet.setColumnWidth(1, 9000); // Category Name
		sheet.setColumnWidth(2, 9000); // Recipes Required
		sheet.setColumnWidth(3, 7000); // Percentage
		sheet.setColumnWidth(4, 8000); // Summary values
	}

	// Helper method for label-value pairs
	private void createLabelValuePair(Row row, int startCol, String label, String value, CellStyle labelStyle,
			CellStyle valueStyle) {
		Cell labelCell = row.createCell(startCol);
		labelCell.setCellValue(label);
		labelCell.setCellStyle(labelStyle);

		Cell valueCell = row.createCell(startCol + 1);
		valueCell.setCellValue(value);
		valueCell.setCellStyle(valueStyle);
	}

	public ResponseDTO<MealSetTemplateDTO> handleSaveException(Exception e, ResponseDTO<MealSetTemplateDTO> response) {

		if (e instanceof DataAccessException) {
			log.error(AppConstants.DATA_EXCEPTION_SAVE + AppConstants.MEAL_SET_TEMPLATE, e);
			response.setMessage(AppConstants.DATA_EXCEPTION_SAVE);
		} else if (e instanceof RestException) {
			log.warn(AppConstants.REST_EXCEPTION_SAVE + AppConstants.MEAL_SET_TEMPLATE, e);
			response.setMessage(e.getMessage());
		} else {
			log.error(AppConstants.EXCEPTION_SAVING + AppConstants.MEAL_SET_TEMPLATE, e);
			response.setMessage(AppConstants.EXCEPTION_SAVING);
		}

		response.setSuccess(AppConstants.FALSE);
		return response;
	}

	private <T> ResponseDTO<List<ComboBoxDTO>> buildComboResponse(List<T> list, ToIntFunction<T> idFn,
			Function<T, String> nameFn, Function<T, String> codeFn) {

		ResponseDTO<List<ComboBoxDTO>> response = new ResponseDTO<>();
		List<ComboBoxDTO> comboList = new ArrayList<>();

		if (list == null || list.isEmpty()) {
			response.setSuccess(false);
			response.setMessage(AppConstants.EMPTY_DATA);
			response.setData(comboList);
			return response;
		}

		for (T hib : list) {
			ComboBoxDTO dto = new ComboBoxDTO();
			dto.setPk(idFn.applyAsInt(hib));
			dto.setName(nameFn.apply(hib));
			dto.setCode(codeFn.apply(hib));
			comboList.add(dto);
		}

		response.setSuccess(true);
		response.setData(comboList);
		return response;
	}

}
