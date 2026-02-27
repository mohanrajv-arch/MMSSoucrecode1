package esfita.service;

import java.io.ByteArrayOutputStream;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Date;
import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.TimeZone;
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
import org.apache.poi.ss.usermodel.VerticalAlignment;
import org.apache.poi.ss.util.CellRangeAddress;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataAccessException;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import esfita.common.AppConstants;
import esfita.common.ComboBoxDTO;
import esfita.common.ResponseDTO;
import esfita.dto.IssueMenuToLocationDTO;
import esfita.entity.FinalSetMenuDHib;
import esfita.entity.FinalSetMenuHHib;
import esfita.entity.FinalSetMenuIHib;
import esfita.entity.FinalSetMenuMHib;
import esfita.entity.IssueMenuDHib;
import esfita.entity.IssueMenuHHib;
import esfita.entity.IssueMenuIHib;
import esfita.entity.IssueMenuMHib;
import esfita.entity.MealSetTemplateDHib;
import esfita.entity.MealSetTemplateHHib;
import esfita.entity.MstLocationMenuHib;
import esfita.entity.MstLocationUserMappingHib;
import esfita.entity.RecipeDHib;
import esfita.entity.RecipeHHib;
import esfita.repository.FinalSetMenuDRepository;
import esfita.repository.FinalSetMenuHRepository;
import esfita.repository.FinalSetMenuIRepository;
import esfita.repository.FinalSetMenuMRepository;
import esfita.repository.IssueMenuDRepository;
import esfita.repository.IssueMenuHRepository;
import esfita.repository.IssueMenuIRepository;
import esfita.repository.IssueMenuMRepository;
import esfita.repository.MealSetTemplateDRepository;
import esfita.repository.MealSetTemplateHRepository;
import esfita.repository.MstLocationMenuRepository;
import esfita.repository.MstLocationUserMappingRepository;
import esfita.repository.MstUserRepository;
import esfita.repository.RecipeDRepository;
import esfita.repository.RecipeHRepository;
import esfita.utils.RestException;
import jakarta.transaction.Transactional;
import lombok.extern.log4j.Log4j2;

@Service
@Log4j2
public class IssueMenuService {

	private static final String DATE_FORMAT = "yyyy-MM-dd";

	private final RecipeHRepository recipeHRepository;
	private final RecipeDRepository recipeDRepository;
	private final IssueMenuDRepository issueMenuDRepository;
	private final IssueMenuHRepository issueMenuHRepository;
	private final IssueMenuMRepository issueMenuMRepository;
	private final IssueMenuIRepository issueMenuIRepository;
	private final MstLocationMenuRepository mstLoctionMenuRepository;

	private final FinalSetMenuMRepository finalSetMenuMRepository;
	private final FinalSetMenuHRepository finalSetMenuHRepository;
	private final FinalSetMenuDRepository finalSetMenuDRepository;
	private final FinalSetMenuIRepository finalSetMenuIRepository;
	private final MealSetTemplateDRepository mealSetTemplateDRepository;
	private final MealSetTemplateHRepository mealSetTemplateHRepository;

	private transient MstUserRepository mstUserRepository;

	private final MstLocationUserMappingRepository mstLocationUserMappingRepository;

	public IssueMenuService(RecipeHRepository recipeHRepository, RecipeDRepository recipeDRepository,
			IssueMenuDRepository issueMenuDRepository, IssueMenuHRepository issueMenuHRepository,
			IssueMenuMRepository issueMenuMRepository, IssueMenuIRepository issueMenuIRepository,
			MstLocationMenuRepository mstLoctionMenuRepository, FinalSetMenuMRepository finalSetMenuMRepository,
			FinalSetMenuHRepository finalSetMenuHRepository, FinalSetMenuDRepository finalSetMenuDRepository,
			FinalSetMenuIRepository finalSetMenuIRepository,
			MstLocationUserMappingRepository mstLocationUserMappingRepository,
			MealSetTemplateHRepository mealSetTemplateHRepository,
			MealSetTemplateDRepository mealSetTemplateDRepository,
			MstUserRepository mstUserRepository) {
		this.recipeHRepository = recipeHRepository;
		this.recipeDRepository = recipeDRepository;
		this.issueMenuDRepository = issueMenuDRepository;
		this.issueMenuHRepository = issueMenuHRepository;
		this.issueMenuMRepository = issueMenuMRepository;
		this.issueMenuIRepository = issueMenuIRepository;
		this.mstLoctionMenuRepository = mstLoctionMenuRepository;
		this.finalSetMenuMRepository = finalSetMenuMRepository;
		this.finalSetMenuHRepository = finalSetMenuHRepository;
		this.finalSetMenuDRepository = finalSetMenuDRepository;
		this.finalSetMenuIRepository = finalSetMenuIRepository;
		this.mstLocationUserMappingRepository = mstLocationUserMappingRepository;
		this.mealSetTemplateDRepository = mealSetTemplateDRepository;
		this.mealSetTemplateHRepository = mealSetTemplateHRepository;
		this.mstUserRepository  = mstUserRepository;

	}

	private static final Logger log = LoggerFactory.getLogger(IssueMenuService.class);

	public ResponseDTO<List<ComboBoxDTO>> loadFinalMenuDropDown() {
		ResponseDTO<List<ComboBoxDTO>> response = new ResponseDTO<>();
		List<ComboBoxDTO> comboList = new ArrayList<>();

		try {
			List<FinalSetMenuMHib> finalSetMenuList = finalSetMenuMRepository.orderBy();

			if (finalSetMenuList != null) {
				for (FinalSetMenuMHib hib : finalSetMenuList) {
					ComboBoxDTO dto = new ComboBoxDTO();
					dto.setPk(hib.getId());
					dto.setName(hib.getName());
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
			log.warn(AppConstants.REST_EXCEPTION + " Final Menu Name", re);
		} catch (Exception e) {
			response.setSuccess(AppConstants.FALSE);
			log.error(AppConstants.EXCEPTION + " Final Menu Name", e);
		}

		return response;
	}

	public ResponseDTO<IssueMenuToLocationDTO> finalMenuDetailsByPk(int id) {
		ResponseDTO<IssueMenuToLocationDTO> response = new ResponseDTO<>();

		try {
			IssueMenuToLocationDTO dto = new IssueMenuToLocationDTO();
			List<IssueMenuToLocationDTO> selectedMenu = new ArrayList<>();

			// ===== 1. Fetch Final Set Menu Headers =====
			FinalSetMenuMHib FinalSetMenuMHib = finalSetMenuMRepository.findById(id);

			List<FinalSetMenuHHib> FinalSetMenuHHib = finalSetMenuHRepository.findActiveHeadersByFinalMenuFk(id);

			if (FinalSetMenuHHib != null && !FinalSetMenuHHib.isEmpty()) {
				for (FinalSetMenuHHib hib : FinalSetMenuHHib) {

					// ===== 2. Fetch Details for each Header =====
					List<FinalSetMenuDHib> headers = finalSetMenuDRepository.findByActCat(id, hib.getMenuFk());

					// new

					Optional<MealSetTemplateHHib> templateHib1 = mealSetTemplateHRepository
							.findById(hib.getTemplateFk());

					if (templateHib1.isPresent()) {
						MealSetTemplateHHib templateHib = templateHib1.get();
						List<MealSetTemplateDHib> templateDetails = mealSetTemplateDRepository
								.findActiveByTemplateFk(templateHib.getId());

						for (MealSetTemplateDHib templateD : templateDetails) {
							int repeatCount = templateD.getRecipesRequired();

							// Get already selected recipes for this category
							List<FinalSetMenuDHib> selectedForCategory = headers.stream()
									.filter(sr -> sr.getCategoryFk() == templateD.getCategoryFk()).toList();

							for (int i = 0; i < repeatCount; i++) {
								IssueMenuToLocationDTO headerDTO = new IssueMenuToLocationDTO();

								if (i < selectedForCategory.size()) {
									// Fill with already selected recipe
									FinalSetMenuDHib menuH = selectedForCategory.get(i);
									headerDTO.setId(menuH.getId());
									headerDTO.setFinalMenuFk(menuH.getFinalMenuFk());
									headerDTO.setMenuFk(menuH.getMenuFk());
									headerDTO.setMealTypeFk(hib.getMealTypeFk());
									headerDTO.setMealTypeName(hib.getMealTypeName());
									headerDTO.setCategoryFk(menuH.getCategoryFk());
									headerDTO.setCategoryName(menuH.getCategoryName());
									headerDTO.setPortionSize(menuH.getPortionSize());
									headerDTO.setPerPortionCost(menuH.getPerPortionCost());
									headerDTO.setUom(menuH.getUom());
									headerDTO.setRecipeFk(menuH.getRecipeFk());
									headerDTO.setRecipeName(menuH.getRecipeName());
								} else {
									// Create an empty slot (no recipe chosen yet)
									headerDTO.setFinalMenuFk(hib.getFinalMenuFk());
									headerDTO.setMenuFk(hib.getMenuFk());
									headerDTO.setMealTypeFk(hib.getMealTypeFk());
									headerDTO.setMealTypeName(hib.getMealTypeName());
									headerDTO.setCategoryFk(templateD.getCategoryFk());
									headerDTO.setCategoryName(templateD.getCategoryName());
									// recipe fields intentionally left empty/null
									headerDTO.setPortionSize(0);
									headerDTO.setPerPortionCost(0);
									headerDTO.setUom("");
									headerDTO.setRecipeFk(0);
									headerDTO.setRecipeName("");
									headerDTO.setAddingStatus(1);
								}

								selectedMenu.add(headerDTO);
							}

						}
					}

					/// end
				}
			}
			dto.setTotalCost(FinalSetMenuMHib.getTotal());
			dto.setName(FinalSetMenuMHib.getName());
			dto.setMenuDetail(selectedMenu);
			response.setData(dto);
			response.setSuccess(AppConstants.TRUE);
			response.setMessage(AppConstants.MSG_RECORD_FETCHED);

		} catch (Exception e) {
			log.error("Error while fetching Final Set Menu by ID", e);
			response.setSuccess(AppConstants.FALSE);
			response.setMessage(AppConstants.EXCEPTION);
		}

		return response;
	}

	public ResponseDTO<IssueMenuToLocationDTO> saveIssuedMenu(IssueMenuToLocationDTO dto) {
		ResponseDTO<IssueMenuToLocationDTO> response = new ResponseDTO<>();
		try {
			if (dto == null) {
				response.setSuccess(AppConstants.FALSE);
				response.setMessage(AppConstants.E_DATA);
				return response;
			}

			// 1. Save Issue Menu Master (M)
			IssueMenuMHib master = new IssueMenuMHib();
			master.setFinalMenuFk(dto.getFinalMenuFk());
			SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
			FinalSetMenuMHib M_values = finalSetMenuMRepository.findById(dto.getFinalMenuFk());

			master.setName(M_values.getName());
			master.setNotes(dto.getNotes());
			master.setLocationFk(dto.getLocationFk());
			master.setPob(dto.getPob());
			master.setTotal(dto.getTotalCost());
			master.setStatus(AppConstants.FLAG_A);
			master.setIssueStatus(0); // 0 = Issued
			master.setActualPob(dto.getPob());
			master.setCreatedBy(dto.getCreatedBy());
			master.setCreatedDateTime(new Date());
			master.setLastActBy(dto.getCreatedBy());
			master.setLastActDateTime(new Date());
			// adjust format to your DB
			String formattedDate = null;
			if (dto.getMenuIssuedDate() != null) {
				formattedDate = sdf.format(dto.getMenuIssuedDate());
			}
			master.setMenuDate(formattedDate);
			issueMenuMRepository.save(master);

			// 2. Save Issue Menu Header (H)
			List<FinalSetMenuHHib> finalHeaders = finalSetMenuHRepository
					.findActiveHeadersByFinalMenuFk(dto.getFinalMenuFk());

			if (finalHeaders == null || finalHeaders.isEmpty()) {
				log.error("No active Final Menu Header found for MenuFk: {}", dto.getMenuFk());
				response.setSuccess(false);
				response.setMessage("No active Final Menu Header found for MenuFk: " + dto.getMenuFk());
				return response;
			}

			for (FinalSetMenuHHib finalH : finalHeaders) {
				IssueMenuHHib header = new IssueMenuHHib();
				header.setIssueMenuMFk(master.getId());
				header.setMenuFk(finalH.getMenuFk());
				header.setMenuName(finalH.getMenuName());
				header.setMealTypeFk(finalH.getMealTypeFk());
				header.setMealTypeName(finalH.getMealTypeName());
				header.setTemplateFk(finalH.getTemplateFk());
				header.setTemplateName(finalH.getTemplateName());
				header.setCategoryCount(finalH.getCategoryCount());
				header.setRecipeCount(finalH.getRecipeCount());
				
				
				header.setTotalCost(finalH.getTotalCost());
				header.setStatus(finalH.getStatus());
				header.setApprovalStatus(finalH.getApprovalStatus()); // Pending
				header.setCreatedBy(dto.getCreatedBy());
				header.setCreatedDateTime(new Date());
				header.setLastActBy(dto.getCreatedBy());
				header.setLastActDateTime(new Date());

				header.setMenuDate(formattedDate);
				issueMenuHRepository.save(header);

				// 3. Save Menu Details (D)
				List<FinalSetMenuDHib> finalDetails = finalSetMenuDRepository.findByActCat(dto.getFinalMenuFk(),
						finalH.getMenuFk());

				for (FinalSetMenuDHib finalD : finalDetails) {
					IssueMenuToLocationDTO matchDto = null;

					if (dto.getChangedDetails() != null && !dto.getChangedDetails().isEmpty()) {
						Iterator<IssueMenuToLocationDTO> it = dto.getChangedDetails().iterator();
						while (it.hasNext()) {
							IssueMenuToLocationDTO c = it.next();

							if (c.getAddingStatus() == 0 && Objects.equals(c.getMenuFk(), finalD.getMenuFk())
									&& Objects.equals(c.getCategoryFk(), finalD.getCategoryFk())) {

								// Case 1: Recipe is same → update existing record
								if (Objects.equals(c.getRecipeFk(), finalD.getRecipeFk())) {
									matchDto = c;
									it.remove(); // Remove only addingStatus: 0 items
								}
								// Case 2: Recipe is different → replace old with new
								else {
									matchDto = c;
									it.remove(); // Remove only addingStatus: 0 items
								}
								break;
							}
							// DON'T remove addingStatus: 1 items here - they need to be processed in the
							// second loop
						}
					}

					
					// ⚡ If recipe was changed
					if (matchDto != null) {

						// 🚫 CASE: Recipe removed (recipeFk = 0)
						if (matchDto.getRecipeFk() == 0 || matchDto.getRecipeFk() == 0) {
							// Do NOTHING → skip saving this detail completely
							// Old recipe already skipped, new recipe does not exist
							continue;
						}

						// ✅ CASE: Recipe replaced with another recipe
						FinalSetMenuDHib finalRecipe = finalSetMenuDRepository.findByFinalFkMenuFkAndRecipeFk(
								dto.getFinalMenuFk(), header.getMenuFk(), finalD.getCategoryFk(),
								matchDto.getRecipeFk());

						RecipeHHib recipeH = null;

						if (finalRecipe == null) {
							recipeH = recipeHRepository.findByRecipeFk(matchDto.getRecipeFk());
							if (recipeH == null) {
								throw new RuntimeException("Changed Recipe not found: " + matchDto.getRecipeFk());
							}
						}

						// 🔽 CONTINUE with IssueMenuDHib creation

						// Create IssueMenuDHib
						IssueMenuDHib detail = new IssueMenuDHib();
						detail.setIssueMenuMFk(master.getId());
						detail.setIssueMenuHFk(header.getId());
						detail.setMenuFk(finalD.getMenuFk());
						detail.setCategoryFk(finalD.getCategoryFk());
						detail.setCategoryName(finalD.getCategoryName());

						if (finalRecipe != null) {
							// Populate from FinalSetMenuDHib
							detail.setRecipeFk(finalRecipe.getRecipeFk());
							detail.setRecipeName(finalRecipe.getRecipeName());
							detail.setUniqueNo(finalRecipe.getUniqueNo());
							detail.setRefNo(finalRecipe.getRefNo());
							detail.setCookingInstruction(finalRecipe.getCookingInstruction());
							detail.setCountryOriginFk(finalRecipe.getCountryOriginFk());
							detail.setBaseQuantityFk(finalRecipe.getBaseQuantityFk());
							detail.setBaseQuantity(finalRecipe.getBaseQuantity());
							detail.setUom(finalRecipe.getUom());
							detail.setFinishedProduct(finalRecipe.getFinishedProduct());
							detail.setPortionSize(finalRecipe.getPortionSize());
							detail.setImageUrl(finalRecipe.getImageUrl());
							detail.setPerPortionCost(finalRecipe.getPerPortionCost());
						} else {
							// Populate from RECIPE_H_HIB
							detail.setRecipeFk(recipeH.getId());
							detail.setRecipeName(recipeH.getRecipeName());
							detail.setUniqueNo(recipeH.getUniqueNo());
							detail.setRefNo(recipeH.getRefNo());
							detail.setCookingInstruction(recipeH.getCookingInstruction());
							detail.setCountryOriginFk(recipeH.getCountryOriginFk());
							detail.setBaseQuantityFk(recipeH.getBaseQuantityFk());
							detail.setBaseQuantity(recipeH.getBaseQuantity());
							detail.setUom(recipeH.getUom());
							detail.setFinishedProduct(recipeH.getFinishedProduct());
							detail.setPortionSize(recipeH.getPortionSize());
							detail.setImageUrl(recipeH.getImageUrl());
							detail.setPerPortionCost(recipeH.getPerPortionCost());
						}

						// Handle participation from DTO
						IssueMenuToLocationDTO uiDetail = null;
						if (dto.getMenuDetail() != null) {
							uiDetail = dto.getMenuDetail().stream()
									.filter(d -> (Objects.equals(d.getMenuFk(), detail.getMenuFk()))
											&& (Objects.equals(d.getCategoryFk(), detail.getCategoryFk()))
											&& (Objects.equals(d.getRecipeFk(), detail.getRecipeFk())))
									.findFirst().orElse(null);
						}

						if (uiDetail != null) {
							detail.setPobParticipation(uiDetail.getPobParticipation());
							detail.setActualPobParticipation(uiDetail.getPobParticipation());
						}

						// Calculate cost
						detail.setTotalCost(
								(master.getPob() * detail.getPobParticipation() / 100.0) * detail.getPerPortionCost());

						// Audit fields
						detail.setStatus(AppConstants.FLAG_A);
						detail.setCreatedBy(dto.getCreatedBy());
						detail.setCreatedDateTime(new Date());
						detail.setLastActBy(dto.getCreatedBy());
						detail.setLastActDateTime(new Date());
						detail.setMenuDate(formattedDate);

						// Save
						issueMenuDRepository.save(detail);

						if (finalRecipe != null) {
							// Save Ingredients from NEW recipe
							List<FinalSetMenuIHib> ingredients = finalSetMenuIRepository.findItems(finalRecipe.getId(),
									finalRecipe.getRecipeFk());

							for (FinalSetMenuIHib ing : ingredients) {
								IssueMenuIHib item = new IssueMenuIHib();
								item.setIssueMenuMFk(master.getId());
								item.setIssueMenuHFk(header.getId());
								item.setIssueMenuDFk(detail.getId());
								item.setMenuFk(finalH.getId());
								item.setMenuDFk(ing.getMenuDFk());
								item.setRecipeFk(finalRecipe.getRecipeFk());
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
								item.setMenuDate(formattedDate);
								item.setPobParticipation(detail.getPobParticipation());
								issueMenuIRepository.save(item);
							}
						} else {
							// Save Ingredients from NEW recipe
							List<RecipeDHib> ingredients = recipeDRepository.findByActRecipe(recipeH.getId());

							for (RecipeDHib ing : ingredients) {
								IssueMenuIHib item = new IssueMenuIHib();
								item.setIssueMenuMFk(master.getId());
								item.setIssueMenuHFk(header.getId());
								item.setIssueMenuDFk(detail.getId());
								item.setMenuFk(finalH.getId());
								item.setMenuDFk(0);
								item.setRecipeFk(recipeH.getId());
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

								item.setBaseQuantity(ing.getBaseQuantity() / recipeH.getBaseQuantity());
								item.setSecondaryQuantity(ing.getSecondaryQuantity() / recipeH.getBaseQuantity());
								item.setTotal(ing.getTotal() / recipeH.getBaseQuantity());

								item.setStatus(AppConstants.FLAG_A);
								item.setCreatedBy(dto.getCreatedBy());
								item.setCreatedDateTime(new Date());
								item.setLastActBy(dto.getCreatedBy());
								item.setLastActDateTime(new Date());
								item.setMenuDate(formattedDate);
								item.setPobParticipation(detail.getPobParticipation());
								issueMenuIRepository.save(item);
							}
						}

					}
				}

				// After processing all finalDetails
				if (dto.getChangedDetails() != null && !dto.getChangedDetails().isEmpty()) {
					for (IssueMenuToLocationDTO extra : dto.getChangedDetails()) {
						// These are NEW recipes/categories not in finalDetails
						if (extra.getMealTypeFk() == header.getMealTypeFk() && extra.getAddingStatus() == 1
								&& extra.getRecipeFk() != 0) {
							RecipeHHib newRecipe = recipeHRepository.findActiveByRecipeFk(extra.getRecipeFk());
							if (newRecipe != null) {

								IssueMenuDHib detail = new IssueMenuDHib();
								detail.setIssueMenuMFk(master.getId());
								detail.setIssueMenuHFk(header.getId());
								detail.setMenuFk(extra.getMenuFk());
								detail.setCategoryFk(extra.getCategoryFk());
								detail.setCategoryName(extra.getCategoryName());
								detail.setRecipeFk(newRecipe.getId());
								detail.setRecipeName(newRecipe.getRecipeName());
								detail.setUniqueNo(newRecipe.getUniqueNo());
								detail.setRefNo(newRecipe.getRefNo());
								detail.setCookingInstruction(newRecipe.getCookingInstruction());
								detail.setCountryOriginFk(newRecipe.getCountryOriginFk());
								detail.setBaseQuantityFk(newRecipe.getBaseQuantityFk());
								detail.setBaseQuantity(newRecipe.getBaseQuantity());
								detail.setUom(newRecipe.getUom());
								detail.setFinishedProduct(newRecipe.getFinishedProduct());
								detail.setPortionSize(newRecipe.getPortionSize());
								detail.setImageUrl(newRecipe.getImageUrl());

								detail.setPobParticipation(extra.getPobParticipation());
								detail.setActualPobParticipation(extra.getPobParticipation());
								detail.setPerPortionCost(newRecipe.getPerPortionCost());
								detail.setTotalCost((master.getPob() * detail.getPobParticipation() / 100)
										* detail.getPerPortionCost());

								detail.setStatus(AppConstants.FLAG_A);
								detail.setCreatedBy(dto.getCreatedBy());
								detail.setCreatedDateTime(new Date());
								detail.setLastActBy(dto.getCreatedBy());
								detail.setLastActDateTime(new Date());
								detail.setMenuDate(formattedDate);

								issueMenuDRepository.save(detail);

								// Save Ingredients for NEW recipe
								List<RecipeDHib> ingredients = recipeDRepository.findByActRecipe(newRecipe.getId());
								for (RecipeDHib ing : ingredients) {
									IssueMenuIHib item = new IssueMenuIHib();
									item.setIssueMenuMFk(master.getId());
									item.setIssueMenuHFk(header.getId());
									item.setIssueMenuDFk(detail.getId());
									item.setMenuFk(extra.getMenuFk());
									item.setRecipeFk(newRecipe.getId());
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
									item.setCreatedBy(dto.getCreatedBy());
									item.setCreatedDateTime(new Date());
									item.setLastActBy(dto.getCreatedBy());
									item.setLastActDateTime(new Date());
									item.setMenuDate(formattedDate);

									issueMenuIRepository.save(item);
								}
							}
						}
					}
				}

			}

			response.setSuccess(AppConstants.TRUE);
			response.setMessage("Issued Menu saved successfully!");

		} catch (DataAccessException dae) {
			log.error(AppConstants.DATA_EXCEPTION_SAVE + " Issued Menu .", dae);
			response.setSuccess(AppConstants.FALSE);
			response.setMessage(AppConstants.DATA_EXCEPTION_SAVE);
		} catch (RestException re) {
			log.warn(AppConstants.DATA_EXCEPTION_SAVE + " Issued Menu..", re);
			response.setSuccess(AppConstants.FALSE);
			response.setMessage(re.getMessage());
		} catch (Exception e) {
			log.error(AppConstants.EXCEPTION_SAVING + " Issued Menu...", e);
			response.setSuccess(AppConstants.FALSE);
			response.setMessage(AppConstants.EXCEPTION_SAVING);
		}
		return response;
	}

	public ResponseDTO<IssueMenuToLocationDTO> saveIssuedMenu1(IssueMenuToLocationDTO dto) {
		ResponseDTO<IssueMenuToLocationDTO> response = new ResponseDTO<>();
		try {
			if (dto == null) {
				response.setSuccess(AppConstants.FALSE);
				response.setMessage(AppConstants.E_DATA);
				return response;
			}

			// 1. Save Issue Menu Master (M)
			IssueMenuMHib master = new IssueMenuMHib();
			master.setFinalMenuFk(dto.getFinalMenuFk());
			SimpleDateFormat sdf = new SimpleDateFormat(DATE_FORMAT);
			FinalSetMenuMHib finalMenu = finalSetMenuMRepository.findById(dto.getFinalMenuFk());

			master.setName(finalMenu.getName());
			master.setNotes(dto.getNotes());
			master.setLocationFk(dto.getLocationFk());
			master.setPob(dto.getPob());
			master.setTotal(dto.getTotalCost());
			master.setStatus(AppConstants.FLAG_A);
			master.setIssueStatus(0); // 0 = Issued
			master.setActualPob(dto.getPob());
			master.setCreatedBy(dto.getCreatedBy());
			master.setCreatedDateTime(new Date());
			master.setLastActBy(dto.getCreatedBy());
			master.setLastActDateTime(new Date());

			// Format menu date
			String formattedDate = null;
			if (dto.getMenuIssuedDate() != null) {
				formattedDate = sdf.format(dto.getMenuIssuedDate());
			}
			master.setMenuDate(formattedDate);
			issueMenuMRepository.save(master);

			// 2. Save Issue Menu Header (H)
			List<FinalSetMenuHHib> finalHeaders = finalSetMenuHRepository
					.findActiveHeadersByFinalMenuFk(dto.getFinalMenuFk());

			if (finalHeaders == null || finalHeaders.isEmpty()) {
				log.error("No active Final Menu Header found for MenuFk: {}", dto.getMenuFk());
				response.setSuccess(AppConstants.FALSE);
				response.setMessage("No active Final Menu Header found for MenuFk: " + dto.getMenuFk());
				return response;
			}

			for (FinalSetMenuHHib finalH : finalHeaders) {
				IssueMenuHHib header = new IssueMenuHHib();
				header.setIssueMenuMFk(master.getId());
				header.setMenuFk(finalH.getMenuFk());
				header.setMenuName(finalH.getMenuName());
				header.setMealTypeFk(finalH.getMealTypeFk());
				header.setMealTypeName(finalH.getMealTypeName());
				header.setTemplateFk(finalH.getTemplateFk());
				header.setTemplateName(finalH.getTemplateName());
				header.setCategoryCount(finalH.getCategoryCount());
				header.setRecipeCount(finalH.getRecipeCount());
				header.setTotalCost(finalH.getTotalCost());
				header.setStatus(finalH.getStatus());
				header.setApprovalStatus(finalH.getApprovalStatus());
				header.setCreatedBy(dto.getCreatedBy());
				header.setCreatedDateTime(new Date());
				header.setLastActBy(dto.getCreatedBy());
				header.setLastActDateTime(new Date());
				header.setMenuDate(formattedDate);

				issueMenuHRepository.save(header);

				// 3. Save Menu Details (D)
				List<FinalSetMenuDHib> finalDetails = finalSetMenuDRepository.findByActCat(dto.getFinalMenuFk(),
						finalH.getMenuFk());

				for (FinalSetMenuDHib finalD : finalDetails) {
					IssueMenuToLocationDTO matchDto = null;

					if (dto.getChangedDetails() != null && !dto.getChangedDetails().isEmpty()) {
						Iterator<IssueMenuToLocationDTO> it = dto.getChangedDetails().iterator();
						while (it.hasNext()) {
							IssueMenuToLocationDTO c = it.next();

							if (Objects.equals(c.getMenuFk(), finalD.getMenuFk())
									&& Objects.equals(c.getCategoryFk(), finalD.getCategoryFk())) {

								matchDto = c;
								it.remove();
								break;
							}
						}
					}

					if (matchDto != null) {
						FinalSetMenuDHib finalRecipe = finalSetMenuDRepository.findByFinalFkMenuFkAndRecipeFk(
								dto.getFinalMenuFk(), header.getMenuFk(), finalD.getCategoryFk(),
								matchDto.getRecipeFk());

						RecipeHHib recipeH = null;

						if (finalRecipe == null) {
							recipeH = recipeHRepository.findByRecipeFk(matchDto.getRecipeFk());
							if (recipeH == null) {
								throw new RuntimeException("Changed Recipe not found: " + matchDto.getRecipeFk());
							}
						}

						IssueMenuDHib detail = new IssueMenuDHib();
						detail.setIssueMenuMFk(master.getId());
						detail.setIssueMenuHFk(header.getId());
						detail.setMenuFk(finalD.getMenuFk());
						detail.setCategoryFk(finalD.getCategoryFk());
						detail.setCategoryName(finalD.getCategoryName());

						if (finalRecipe != null) {
							detail.setRecipeFk(finalRecipe.getRecipeFk());
							detail.setRecipeName(finalRecipe.getRecipeName());
							detail.setUniqueNo(finalRecipe.getUniqueNo());
							detail.setRefNo(finalRecipe.getRefNo());
							detail.setCookingInstruction(finalRecipe.getCookingInstruction());
							detail.setCountryOriginFk(finalRecipe.getCountryOriginFk());
							detail.setBaseQuantityFk(finalRecipe.getBaseQuantityFk());
							detail.setBaseQuantity(finalRecipe.getBaseQuantity());
							detail.setUom(finalRecipe.getUom());
							detail.setFinishedProduct(finalRecipe.getFinishedProduct());
							detail.setPortionSize(finalRecipe.getPortionSize());
							detail.setImageUrl(finalRecipe.getImageUrl());
							detail.setPerPortionCost(finalRecipe.getPerPortionCost());
						} else {
							detail.setRecipeFk(recipeH.getId());
							detail.setRecipeName(recipeH.getRecipeName());
							detail.setUniqueNo(recipeH.getUniqueNo());
							detail.setRefNo(recipeH.getRefNo());
							detail.setCookingInstruction(recipeH.getCookingInstruction());
							detail.setCountryOriginFk(recipeH.getCountryOriginFk());
							detail.setBaseQuantityFk(recipeH.getBaseQuantityFk());
							detail.setBaseQuantity(recipeH.getBaseQuantity());
							detail.setUom(recipeH.getUom());
							detail.setFinishedProduct(recipeH.getFinishedProduct());
							detail.setPortionSize(recipeH.getPortionSize());
							detail.setImageUrl(recipeH.getImageUrl());
							detail.setPerPortionCost(recipeH.getPerPortionCost());
						}

						if (dto.getMenuDetail() != null) {
							IssueMenuToLocationDTO uiDetail = dto.getMenuDetail().stream()
									.filter(d -> Objects.equals(d.getMenuFk(), detail.getMenuFk())
											&& Objects.equals(d.getCategoryFk(), detail.getCategoryFk())
											&& Objects.equals(d.getRecipeFk(), detail.getRecipeFk()))
									.findFirst().orElse(null);

							if (uiDetail != null) {
								detail.setPobParticipation(uiDetail.getPobParticipation());
								detail.setActualPobParticipation(uiDetail.getPobParticipation());
							}
						}

						detail.setTotalCost(
								(master.getPob() * detail.getPobParticipation() / 100.0) * detail.getPerPortionCost());
						detail.setStatus(AppConstants.FLAG_A);
						detail.setCreatedBy(dto.getCreatedBy());
						detail.setCreatedDateTime(new Date());
						detail.setLastActBy(dto.getCreatedBy());
						detail.setLastActDateTime(new Date());
						detail.setMenuDate(formattedDate);

						issueMenuDRepository.save(detail);

						// 4. Save Ingredients (I)
						if (finalRecipe != null) {
							List<FinalSetMenuIHib> ingredients = finalSetMenuIRepository.findItems(finalRecipe.getId(),
									finalRecipe.getRecipeFk());
							for (FinalSetMenuIHib ing : ingredients) {
								IssueMenuIHib item = new IssueMenuIHib();
								item.setIssueMenuMFk(master.getId());
								item.setIssueMenuHFk(header.getId());
								item.setIssueMenuDFk(detail.getId());
								item.setMenuFk(finalH.getId());
								item.setMenuDFk(ing.getMenuDFk());
								item.setRecipeFk(finalRecipe.getRecipeFk());
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
								item.setMenuDate(formattedDate);
								item.setPobParticipation(detail.getPobParticipation());
								issueMenuIRepository.save(item);
							}
						} else {
							List<RecipeDHib> ingredients = recipeDRepository.findByActRecipe(recipeH.getId());
							for (RecipeDHib ing : ingredients) {
								IssueMenuIHib item = new IssueMenuIHib();
								item.setIssueMenuMFk(master.getId());
								item.setIssueMenuHFk(header.getId());
								item.setIssueMenuDFk(detail.getId());
								item.setMenuFk(finalH.getId());
								item.setMenuDFk(0);
								item.setRecipeFk(recipeH.getId());
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
								item.setBaseQuantity(ing.getBaseQuantity() / recipeH.getBaseQuantity());
								item.setSecondaryQuantity(ing.getSecondaryQuantity() / recipeH.getBaseQuantity());
								item.setTotal(ing.getTotal() / recipeH.getBaseQuantity());
								item.setStatus(AppConstants.FLAG_A);
								item.setCreatedBy(dto.getCreatedBy());
								item.setCreatedDateTime(new Date());
								item.setLastActBy(dto.getCreatedBy());
								item.setLastActDateTime(new Date());
								item.setMenuDate(formattedDate);
								item.setPobParticipation(detail.getPobParticipation());
								issueMenuIRepository.save(item);
							}
						}
					}
				}
			}

			response.setSuccess(AppConstants.TRUE);
			response.setMessage("Issued Menu saved successfully!");

		} catch (DataAccessException dae) {
			log.error(AppConstants.DATA_EXCEPTION_SAVE + " IssueMenu", dae);
			response.setSuccess(AppConstants.FALSE);
			response.setMessage(AppConstants.DATA_EXCEPTION_SAVE);
		} catch (RestException re) {
			log.warn(AppConstants.REST_EXCEPTION_SAVE + " Issue to Menu", re);
			response.setSuccess(AppConstants.FALSE);
			response.setMessage(re.getMessage());
		} catch (Exception e) {
			log.error(AppConstants.EXCEPTION_SAVING + " Issue Menu", e);
			response.setSuccess(AppConstants.FALSE);
			response.setMessage(AppConstants.EXCEPTION_SAVING);
		}

		return response;
	}

	public ResponseDTO<List<IssueMenuToLocationDTO>> issueMenuToLocationList(int locationFk) {
		ResponseDTO<List<IssueMenuToLocationDTO>> response = new ResponseDTO<>();

		try {
			List<IssueMenuMHib> issueMenuList = issueMenuMRepository.findByLocationFk(locationFk);

			if (issueMenuList == null || issueMenuList.isEmpty()) {
				response.setSuccess(AppConstants.TRUE);
				response.setMessage(" records not found for location " + locationFk);
			} else {
				List<IssueMenuToLocationDTO> dtoList = new ArrayList<>();
				SimpleDateFormat sdf = new SimpleDateFormat(DATE_FORMAT);
				sdf.setTimeZone(TimeZone.getTimeZone("UTC"));

				for (IssueMenuMHib entity : issueMenuList) {
					IssueMenuToLocationDTO dto = new IssueMenuToLocationDTO();
					dto.setName(entity.getName());
					dto.setId(entity.getId());
					dto.setFinalMenuFk(entity.getFinalMenuFk());
					Date parsedDate = sdf.parse(entity.getMenuDate());
					dto.setMenuIssuedDate(parsedDate);
					dto.setPob(entity.getPob());

					List<IssueMenuHHib> issueMenuHeaders = issueMenuHRepository.findList(entity.getId());
					for (IssueMenuHHib hib : issueMenuHeaders) {
						dto.setMealTypeName(hib.getMealTypeName());
					}

					dtoList.add(dto);
				}

				response.setData(dtoList);
				response.setSuccess(AppConstants.TRUE);
				response.setMessage(AppConstants.MSG_RECORD_FETCHED);
			}

		} catch (Exception e) {
			log.error("Error while fetching Final Menu List", e);
			response.setSuccess(AppConstants.FALSE);
			response.setMessage("Error  while fetching records.");
		}

		return response;
	}

	public ResponseDTO<IssueMenuToLocationDTO> issueMenuApprovedStatusList() {
		ResponseDTO<IssueMenuToLocationDTO> response = new ResponseDTO<>();

		try {
			List<IssueMenuMHib> issueMenuList = issueMenuMRepository.findAll();
			IssueMenuToLocationDTO mainDTO = new IssueMenuToLocationDTO();

			if (issueMenuList != null && !issueMenuList.isEmpty()) {

				// 0 = Approved, 1 = Rejected, 2 = Pending
				List<IssueMenuToLocationDTO> approvedList = new ArrayList<>();
				List<IssueMenuToLocationDTO> rejectedList = new ArrayList<>();
				List<IssueMenuToLocationDTO> pendingList = new ArrayList<>();

				for (IssueMenuMHib entity : issueMenuList) {
					IssueMenuToLocationDTO dto = new IssueMenuToLocationDTO();
					dto.setId(entity.getId());
					dto.setName(entity.getName());
					dto.setPob(entity.getPob());
					dto.setFinalMenuFk(entity.getFinalMenuFk());

					MstLocationMenuHib locationHib = mstLoctionMenuRepository.findById(entity.getLocationFk());
					if (locationHib != null) {
						dto.setLocationName(locationHib.getLocationName());
					}

					dto.setMenuIssuedDate(
							entity.getMenuDate() != null ? new SimpleDateFormat(DATE_FORMAT).parse(entity.getMenuDate())
									: null);
					dto.setMenuDateStr(entity.getMenuDate());

					if (entity.getIssueStatus() == 1) {
						approvedList.add(dto);
					} else if (entity.getIssueStatus() == 2) {
						rejectedList.add(dto);
					} else {
						pendingList.add(dto);
					}
				}

				mainDTO.setApprovedApprovals(approvedList);
				mainDTO.setRejectedApprovals(rejectedList);
				mainDTO.setPendingApprovals(pendingList);

				response.setData(mainDTO);
				response.setSuccess(AppConstants.TRUE);
				response.setMessage("Issued Menu records " + AppConstants.MSG_RECORD_FETCHED);

			} else {
				response.setSuccess(AppConstants.FALSE);
				response.setMessage("No records found");
			}

		} catch (Exception e) {
			log.error(AppConstants.EXCEPTION + " Issued Menu {}", e);
			response.setSuccess(AppConstants.FALSE);
			response.setMessage(AppConstants.EXCEPTION);
		}

		return response;
	}

	public ResponseDTO<IssueMenuToLocationDTO> updateApprovalStatus(IssueMenuToLocationDTO dto) {
		ResponseDTO<IssueMenuToLocationDTO> response = new ResponseDTO<>();

		try {
			if (dto == null) {
				response.setSuccess(AppConstants.FALSE);
				response.setMessage(AppConstants.E_DATA);
				return response;
			}

			IssueMenuMHib master = issueMenuMRepository.findById(dto.getId());
			if (master == null) {
				response.setSuccess(AppConstants.FALSE);
				response.setMessage("No issued menu found for ID: " + dto.getId());
				return response;
			}

			master.setIssueStatus(dto.getApprovalStatus());
			master.setLastActBy(dto.getCreatedBy());
			master.setLastActDateTime(new Date());
			issueMenuMRepository.save(master);

			response.setSuccess(AppConstants.TRUE);
			response.setMessage("Issued Menu updated successfully!");

		} catch (DataAccessException dae) {
			log.error(AppConstants.DATA_EXCEPTION_SAVE + " IssuedMenu", dae);
			response.setSuccess(AppConstants.FALSE);
			response.setMessage(AppConstants.DATA_EXCEPTION_SAVE);
		} catch (RestException re) {
			log.warn(AppConstants.REST_EXCEPTION_SAVE + " Issued  Menu", re);
			response.setSuccess(AppConstants.FALSE);
			response.setMessage(re.getMessage());
		} catch (Exception e) {
			log.error(AppConstants.EXCEPTION_SAVING + " Issued Menu ", e);
			response.setSuccess(AppConstants.FALSE);
			response.setMessage(AppConstants.EXCEPTION_SAVING);
		}

		return response;
	}

	public ResponseDTO<List<IssueMenuToLocationDTO>> issueMenuToLocationUserList(int id) {
		ResponseDTO<List<IssueMenuToLocationDTO>> response = new ResponseDTO<>();
		try {
			List<IssueMenuMHib> menus = issueMenuMRepository.findMenusByLocatioFk(id);

			if (menus == null || menus.isEmpty()) {
				response.setSuccess(AppConstants.TRUE);
				response.setMessage("No records found for location ");
			} else {
				List<IssueMenuToLocationDTO> dtoList = new ArrayList<>();
				SimpleDateFormat sdf = new SimpleDateFormat(DATE_FORMAT);
				sdf.setTimeZone(TimeZone.getTimeZone("UTC"));

				for (IssueMenuMHib entity : menus) {
					IssueMenuToLocationDTO dto = new IssueMenuToLocationDTO();
					dto.setName(entity.getName());
					dto.setId(entity.getId());
					dto.setFinalMenuFk(entity.getFinalMenuFk());
					Date parsedDate = sdf.parse(entity.getMenuDate());
					dto.setMenuIssuedDate(parsedDate);
					dto.setTotalCost(entity.getTotal());
					dto.setPob(entity.getPob());

					dto.setStatusStr(entity.getStatus() == 'A' ? "Active" : "In-Active");
					dto.setIssuedStatusStr(entity.getIssueStatus() == 3 ? "Finalized" : "draft");

					List<IssueMenuHHib> headers = issueMenuHRepository.findList(entity.getId());
					List<IssueMenuToLocationDTO> mealTypes = new ArrayList<>();
					for (IssueMenuHHib hib : headers) {
						IssueMenuToLocationDTO dtos = new IssueMenuToLocationDTO();
						dtos.setMealTypeFk(hib.getMealTypeFk());
						dtos.setMealTypeName(hib.getMealTypeName());
						mealTypes.add(dtos);
					}
					dto.setMenuDetail(mealTypes);
					dtoList.add(dto);
				}

				response.setData(dtoList);
				response.setSuccess(AppConstants.TRUE);
				response.setMessage(AppConstants.MSG_RECORD_FETCHED);
			}
		} catch (Exception e) {
			log.error("Error fetching Final Menu List", e);
			response.setSuccess(AppConstants.FALSE);
			response.setMessage("Error occurred while fetching records.");
		}
		return response;
	}

	private String getApproverName(Integer approverId) {
		if (approverId == null)
			return "";
		return mstUserRepository.findById(approverId).map(u -> u.getFirstName()).orElse("");
	}
	public ResponseDTO<IssueMenuToLocationDTO> issueMenuToLocationUserTabList(int id) {
		ResponseDTO<IssueMenuToLocationDTO> response = new ResponseDTO<>();

		try {
			IssueMenuMHib entity = issueMenuMRepository.findById(id);
			IssueMenuToLocationDTO dto = new IssueMenuToLocationDTO();

			if (entity == null) {
				response.setSuccess(AppConstants.TRUE);
				response.setMessage("No records found");
				return response;
			}

			SimpleDateFormat sdf = new SimpleDateFormat(DATE_FORMAT);
			sdf.setTimeZone(TimeZone.getTimeZone("UTC"));

			dto.setId(entity.getId());
			dto.setName(entity.getName());
			dto.setFinalMenuFk(entity.getFinalMenuFk());
			dto.setMenuIssuedDate(sdf.parse(entity.getMenuDate()));
			dto.setPob(entity.getActualPob());
			dto.setIssueStatus(entity.getIssueStatus());
			dto.setIssuedStatusStr(entity.getIssueStatus() == 3 ? "Finalized" : "Draft");
			dto.setStatusStr(entity.getStatus() == 'A' ? "Active" : "Inactive");
			dto.setLocationFk(entity.getLocationFk());
			dto.setNotes(entity.getNotes());

			MstLocationMenuHib loc = mstLoctionMenuRepository.findById(entity.getLocationFk());
			if (loc != null) {
				dto.setLocationCode(loc.getLocationId());
				dto.setLocationName(loc.getLocationName());
			}

			List<IssueMenuToLocationDTO> selectedMenu = new ArrayList<>();
			double totalCost = 0;

			// ===== ISSUE MENU HEADERS =====
			List<IssueMenuHHib> issueHeaders = issueMenuHRepository.findList(entity.getId());

			for (IssueMenuHHib hib : issueHeaders) {

				// ===== ISSUE MENU DETAILS (existing recipes) =====
				List<IssueMenuDHib> issueDetails = issueMenuDRepository.findByIssueMenuHFk(hib.getId());

				// ===== TEMPLATE =====
				Optional<MealSetTemplateHHib> templateOpt = mealSetTemplateHRepository.findById(hib.getTemplateFk());

				if (!templateOpt.isPresent())
					continue;

				MealSetTemplateHHib templateH = templateOpt.get();
				List<MealSetTemplateDHib> templateDetails = mealSetTemplateDRepository
						.findActiveByTemplateFk(templateH.getId());

				for (MealSetTemplateDHib templateD : templateDetails) {

					int repeatCount = templateD.getRecipesRequired();

					// Existing recipes for category
					List<IssueMenuDHib> selectedForCategory = issueDetails.stream()
							.filter(d -> d.getCategoryFk() == templateD.getCategoryFk()).toList();

					for (int i = 0; i < repeatCount; i++) {

						IssueMenuToLocationDTO row = new IssueMenuToLocationDTO();

						row.setIssueMenuHFk(hib.getId());
						row.setMenuFk(hib.getMenuFk());
						row.setMealTypeFk(hib.getMealTypeFk());
						row.setMealTypeName(hib.getMealTypeName());
						row.setCategoryFk(templateD.getCategoryFk());
						row.setCategoryName(templateD.getCategoryName());

						if (i < selectedForCategory.size()) {
							// ===== EXISTING RECIPE =====
							IssueMenuDHib d = selectedForCategory.get(i);

							row.setIssueMenuDFk(d.getId());
							row.setRecipeFk(d.getRecipeFk());
							row.setRecipeName(d.getRecipeName());
							row.setPortionSize(d.getPortionSize());
							row.setPerPortionCost(d.getPerPortionCost());
							row.setUom(d.getUom());
							row.setPobParticipation(d.getActualPobParticipation());

							double cost = d.getPerPortionCost() * dto.getPob() * d.getActualPobParticipation() / 100;
							row.setTotalCost(cost);
							totalCost += cost;

						} else {
							// ===== EMPTY SLOT (ADD NEW RECIPE) =====
							row.setRecipeFk(0);
							row.setRecipeName("");
							row.setPortionSize(0);
							row.setPerPortionCost(0);
							row.setUom("");
							row.setPobParticipation(0);
							row.setAddingStatus(1); // 🔥 IMPORTANT
						}

						selectedMenu.add(row);
					}
				}
			}

			dto.setTotalCost(totalCost);
			dto.setMenuDetail(selectedMenu);

			response.setData(dto);
			response.setSuccess(AppConstants.TRUE);
			response.setMessage(AppConstants.MSG_RECORD_FETCHED);

		} catch (Exception e) {
			log.error("Error fetching Issue Menu (template based)", e);
			response.setSuccess(AppConstants.FALSE);
			response.setMessage(AppConstants.EXCEPTION);
		}

		return response;
	}

	public ResponseDTO<IssueMenuToLocationDTO> updateIssuedMenuStatusAndPob(IssueMenuToLocationDTO dto) {
		ResponseDTO<IssueMenuToLocationDTO> response = new ResponseDTO<>();
		try {
			if (dto == null || dto.getId() == 0) {
				response.setSuccess(AppConstants.FALSE);
				response.setMessage("Invalid request: DTO or ID missing.");
				return response;
			}

			IssueMenuMHib master = issueMenuMRepository.findById(dto.getId());
			if (master == null) {
				response.setSuccess(AppConstants.FALSE);
				response.setMessage("Issued menu not found for id: " + dto.getId());
				return response;
			}

			master.setIssueStatus(dto.getIssueStatus());
			master.setActualPob(dto.getPob());
			master.setTotal(dto.getTotalCost());
			master.setLastActBy(dto.getCreatedBy());
			master.setLastActDateTime(new Date());
			issueMenuMRepository.save(master);

			List<IssueMenuDHib> details = issueMenuDRepository.findByIssueMenuMFk(dto.getId());
			if (details != null && dto.getDetailList() != null) {
				for (IssueMenuDHib detail : details) {
					IssueMenuToLocationDTO uiDetail = dto.getDetailList().stream()
							.filter(d -> Objects.equals(d.getRecipeFk(), detail.getRecipeFk())
									&& Objects.equals(d.getCategoryFk(), detail.getCategoryFk())
									&& Objects.equals(d.getMealTypeFk(), detail.getMenuFk()))
							.findFirst().orElse(null);

					if (uiDetail != null) {
						detail.setActualPobParticipation(uiDetail.getPobParticipation());
						detail.setTotalCost(uiDetail.getTotalCost());
						detail.setLastActBy(dto.getCreatedBy());
						detail.setLastActDateTime(new Date());
						issueMenuDRepository.save(detail);

						List<IssueMenuIHib> ingredients = issueMenuIRepository.findByMenuD(detail.getId());
						if (ingredients != null) {
							for (IssueMenuIHib i : ingredients) {
								i.setPobParticipation(uiDetail.getPobParticipation());
								issueMenuIRepository.save(i);
							}
						}
					}
				}
			}

			response.setSuccess(AppConstants.TRUE);
			response.setMessage("Issued Menu updated successfully!");
			response.setData(dto);

		} catch (Exception e) {
			log.error("Error updating issued menu status and POB", e);
			response.setSuccess(AppConstants.FALSE);
			response.setMessage("Failed to update issued menu.");
		}
		return response;
	}

	public ResponseDTO<List<IssueMenuToLocationDTO>> fetchIssuedMenuItemsByDFk(IssueMenuToLocationDTO dtos) {
		ResponseDTO<List<IssueMenuToLocationDTO>> response = new ResponseDTO<>();
		try {
			// Fetch items directly from I table using D_FK
			List<IssueMenuIHib> items = issueMenuIRepository
					.findByIssueMenuDFkAndRecipeFkAndCategoryFk(dtos.getIssueMenuDFk(), dtos.getRecipeFk());

			if (items == null || items.isEmpty()) {
				response.setSuccess(AppConstants.FALSE);
				response.setMessage("No items found for given detail fk: " + dtos);
				response.setData(Collections.emptyList());
				return response;
			}

			IssueMenuDHib details = issueMenuDRepository.findById(dtos.getIssueMenuDFk());

			// Convert entities → DTOs
			List<IssueMenuToLocationDTO> itemDtos = items.stream().map(entity -> {
				IssueMenuToLocationDTO dto = new IssueMenuToLocationDTO();
				dto.setId(entity.getId());
				dto.setIssueMenuDFk(entity.getIssueMenuDFk());

				dto.setRecipeName(details.getRecipeName());
				dto.setCategoryName(details.getCategoryName());

				dto.setItemCode(entity.getItemCode());
				dto.setItemName(entity.getItemName());
				dto.setPackageId(entity.getPackageId());
				dto.setPackagePrice(entity.getPackagePrice());
				dto.setPackageBaseFactor(entity.getPackageBaseFactor());
				dto.setPackageSecondaryFactor(entity.getPackageSecondaryFactor());
				dto.setPackageBaseUnit(entity.getPackageBaseUnit());
				dto.setPackageSecondaryUnit(entity.getPackageSecondaryUnit());
				dto.setPackageSecondaryCost(entity.getPackageSecondaryCost());
				dto.setBaseQuantity(entity.getBaseQuantity());
				dto.setSecondaryQuantity(entity.getSecondaryQuantity());
				dto.setTotal(entity.getTotal());
				return dto;
			}).toList();

			// ✅ Calculate grand total
//						double grandTotal = itemDtos.stream().mapToDouble(dto -> dto.getTotal() != 0.0 ? dto.getTotal() : 0.0)
//								.sum();

			response.setSuccess(AppConstants.TRUE);
			response.setMessage("Items fetched successfully!");
			response.setData(itemDtos);

		} catch (Exception e) {
			log.error("Error fetching issued menu items by D_FK", e);
			response.setSuccess(AppConstants.FALSE);
			response.setMessage("Failed to fetch issued menu items.");
		}
		return response;
	}

	public ResponseDTO<List<ComboBoxDTO>> loadLocationDropDown() {

		ResponseDTO<List<ComboBoxDTO>> response = new ResponseDTO<>();
		List<ComboBoxDTO> comboList = new ArrayList<>();
		try {
			List<MstLocationMenuHib> locations = mstLoctionMenuRepository.orderByActive();
			if (locations != null) {
				for (MstLocationMenuHib location : locations) {
					ComboBoxDTO dto = new ComboBoxDTO();
					dto.setPk(location.getLocationPk());
					dto.setCode(location.getLocationId());
					dto.setName(location.getLocationName());
					comboList.add(dto);
				}
			}
			response.setSuccess(AppConstants.TRUE);
			response.setData(comboList);
		} catch (RestException re) {
			response.setSuccess(AppConstants.FALSE);
			log.warn(AppConstants.REST_EXCEPTION + " -Location List", re);

		} catch (Exception e) {
			response.setSuccess(AppConstants.FALSE);
			log.error(AppConstants.EXCEPTION + " -- LocationList", e);
		}
		return response;
	}
	
	public ResponseEntity<byte[]> printexcelreportForMaterial(int id, int userId) {try {
	    // ===== FETCH DATA =====
	    ResponseDTO<IssueMenuToLocationDTO> response = issueMenuToLocationUserTabList(id);
	    IssueMenuToLocationDTO data = response.getData();

	    if (data == null || data.getMenuDetail() == null || data.getMenuDetail().isEmpty()) {
	        return ResponseEntity.badRequest()
	                .body("No records found".getBytes());
	    }

	    SimpleDateFormat sdf = new SimpleDateFormat("dd-MM-yyyy");
	    StringBuilder csv = new StringBuilder();

	    // ===== HEADER INFO =====
	    csv.append("Issue Menu To Location Report\n");
	    csv.append("Project Name,").append(data.getMenuName()).append("\n");
	    csv.append("Generated By,").append(getApproverName(userId)).append("\n");
	    csv.append("Generated Date,").append(sdf.format(new Date())).append("\n");
	    csv.append("POB,").append(data.getPob()).append("\n");
	    csv.append("Total Cost,").append(data.getTotalCost()).append("\n\n");

	    // ===== COLUMN HEADERS =====
	    csv.append("Meal Type,Category,Recipe Name,Ideal Portion,POB %,Final Qty,Final Cost\n");

	    // ===== GROUP DATA =====
	    Map<String, List<IssueMenuToLocationDTO>> grouped =
	            data.getMenuDetail().stream()
	                    .filter(d -> d.getRecipeName() != null && !d.getRecipeName().trim().isEmpty())
	                    .collect(Collectors.groupingBy(
	                            IssueMenuToLocationDTO::getMealTypeName
	                    ));

	    double grandTotal = 0;

	    for (Map.Entry<String, List<IssueMenuToLocationDTO>> entry : grouped.entrySet()) {

	        String mealType = entry.getKey();
	        List<IssueMenuToLocationDTO> list = entry.getValue();

	        double subtotal = 0;

	        for (IssueMenuToLocationDTO d : list) {

	            double finalQty = data.getPob() * d.getPobParticipation() / 100;

	            csv.append(mealType).append(",")
	               .append(d.getCategoryName()).append(",")
	               .append(d.getRecipeName()).append(",")
	               .append(d.getPortionSize()).append(" ").append(d.getUom()).append(",")
	               .append(d.getPobParticipation()).append(",")
	               .append(finalQty).append(",")
	               .append(d.getTotalCost()).append("\n");

	            subtotal += d.getTotalCost();
	        }

	        // ===== SUBTOTAL ROW =====
	        csv.append(",,,,Subtotal,").append(subtotal).append("\n\n");
	        grandTotal += subtotal;
	    }

	    // ===== GRAND TOTAL =====
	    csv.append(",,,,Grand Total,").append(grandTotal).append("\n");

	    // ===== RESPONSE =====
	    byte[] csvBytes = csv.toString().getBytes(StandardCharsets.UTF_8);

	    HttpHeaders headers = new HttpHeaders();
	    headers.setContentType(MediaType.TEXT_PLAIN);
	    headers.set(HttpHeaders.CONTENT_DISPOSITION,
	            "attachment; filename=MenuDetails.csv");

	    return new ResponseEntity<>(csvBytes, headers, HttpStatus.OK);

	} catch (Exception e) {
	    e.printStackTrace();
	    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
	            .body(("CSV error: " + e.getMessage()).getBytes());
	}
}
	
	public ResponseEntity<byte[]> printexcelreportForMaterialEXL(int id, int userId) {

	    try {
	        // ===== FETCH DATA =====
	        ResponseDTO<IssueMenuToLocationDTO> response = issueMenuToLocationUserTabList(id);
	        IssueMenuToLocationDTO data = response.getData();

	        if (data == null || data.getMenuDetail() == null || data.getMenuDetail().isEmpty()) {
	            return ResponseEntity.badRequest()
	                    .body("No records found".getBytes());
	        }

	        HSSFWorkbook workbook = new HSSFWorkbook();
	        HSSFSheet sheet = workbook.createSheet(
	        	    Optional.ofNullable(data.getMenuName())
	        	            .filter(s -> !s.trim().isEmpty())
	        	            .orElse("Issue_Menu_Report")
	        	);

	        SimpleDateFormat sdf = new SimpleDateFormat("dd-MM-yyyy");

	        // ===== STYLES =====
	        Font boldBlue = workbook.createFont();
	        boldBlue.setBold(true);
	        boldBlue.setColor(IndexedColors.BLUE.getIndex());

	        Font boldBlack = workbook.createFont();
	        boldBlack.setBold(true);

	        CellStyle center = workbook.createCellStyle();
	        center.setAlignment(HorizontalAlignment.CENTER);
	        center.setBorderBottom(BorderStyle.THIN);
	        center.setBorderTop(BorderStyle.THIN);
	        center.setBorderLeft(BorderStyle.THIN);
	        center.setBorderRight(BorderStyle.THIN);
	        center.setFont(boldBlue);

	        CellStyle left = workbook.createCellStyle();
	        left.setAlignment(HorizontalAlignment.LEFT);
	        left.setBorderBottom(BorderStyle.THIN);
	        left.setBorderTop(BorderStyle.THIN);
	        left.setBorderLeft(BorderStyle.THIN);
	        left.setBorderRight(BorderStyle.THIN);

	        CellStyle right = workbook.createCellStyle();
	        right.setAlignment(HorizontalAlignment.RIGHT);
	        right.setBorderBottom(BorderStyle.THIN);
	        right.setBorderTop(BorderStyle.THIN);
	        right.setBorderLeft(BorderStyle.THIN);
	        right.setBorderRight(BorderStyle.THIN);

	        // ===== TITLE =====
	        Row row = sheet.createRow(0);
	        Cell cell = row.createCell(3);
	        cell.setCellValue("Issue Menu To Location Report");
	        cell.setCellStyle(center);

	        // ===== HEADER INFO =====
	        row = sheet.createRow(1);
	        row.createCell(0).setCellValue("Project Name:");
	        row.createCell(1).setCellValue(data.getMenuName());
	        row.createCell(5).setCellValue("Generated Date:");
	        row.createCell(6).setCellValue(sdf.format(new Date()));

	        row = sheet.createRow(2);
	        row.createCell(0).setCellValue("Generated By:");
	        row.createCell(1).setCellValue(getApproverName(userId));

	        // ===== COLUMN HEADERS =====
	        int rowCount = 3;
	        row = sheet.createRow(rowCount);
	        String[] headers = {
	            "Type", "Category", "Recipe Name",
	            "Ideal Portion", "POB %",
	            "Final Qty", "Final Cost"
	        };

	        for (int i = 0; i < headers.length; i++) {
	            cell = row.createCell(i);
	            cell.setCellValue(headers[i]);
	            cell.setCellStyle(center);
	            sheet.setColumnWidth(i, 5000);
	        }

	        // ===== GROUP DATA =====
	        Map<String, List<IssueMenuToLocationDTO>> grouped =
	                data.getMenuDetail().stream()
	                        .filter(d -> d.getRecipeName() != null && !d.getRecipeName().trim().isEmpty())
	                        .collect(Collectors.groupingBy(
	                                IssueMenuToLocationDTO::getMealTypeName
	                        ));

	        double grandTotal = 0;

	        for (Map.Entry<String, List<IssueMenuToLocationDTO>> entry : grouped.entrySet()) {

	            String type = entry.getKey();
	            List<IssueMenuToLocationDTO> list = entry.getValue();

	            int startRow = rowCount + 1;
	            int endRow = startRow + list.size() - 1;
	            double subtotal = 0;

	            for (IssueMenuToLocationDTO d : list) {
	                rowCount++;
	                row = sheet.createRow(rowCount);

	                row.createCell(1).setCellValue(d.getCategoryName());
	                row.createCell(2).setCellValue(d.getRecipeName());
	                row.createCell(3).setCellValue(d.getPortionSize() + " " + d.getUom());
	                row.createCell(4).setCellValue(d.getPobParticipation());

	                double finalQty = data.getPob() * d.getPobParticipation() / 100;
	                row.createCell(5).setCellValue(finalQty);
	                row.createCell(6).setCellValue(d.getTotalCost());

	                subtotal += d.getTotalCost();
	            }

	            // ✅ SAFE MERGE (avoid single-row merge error)
	            if (startRow < endRow) {
	                sheet.addMergedRegion(new CellRangeAddress(startRow, endRow, 0, 0));
	            }

	            Row typeRow = sheet.getRow(startRow);
	            Cell typeCell = typeRow.createCell(0);
	            typeCell.setCellValue(type);
	            typeCell.setCellStyle(center);

	            // ===== SUBTOTAL =====
	            rowCount++;
	            row = sheet.createRow(rowCount);
	            row.createCell(5).setCellValue("Subtotal");
	            row.createCell(6).setCellValue(subtotal);
	            grandTotal += subtotal;
	        }

	        // ===== GRAND TOTAL =====
	        rowCount++;
	        row = sheet.createRow(rowCount);
	        row.createCell(5).setCellValue("Grand Total");
	        row.createCell(6).setCellValue(grandTotal);

	        // ===== WRITE RESPONSE =====
	        ByteArrayOutputStream out = new ByteArrayOutputStream();
	        workbook.write(out);
	        workbook.close();

	        HttpHeaders headersResp = new HttpHeaders();
	        headersResp.setContentType(
	                MediaType.parseMediaType("application/vnd.ms-excel"));
	        headersResp.set(HttpHeaders.CONTENT_DISPOSITION,
	                "attachment; filename=MenuDetails.xls");

	        return new ResponseEntity<>(out.toByteArray(), headersResp, HttpStatus.OK);

	    } catch (Exception e) {
	        e.printStackTrace();
	        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
	                .body(("Excel error: " + e.getMessage()).getBytes());
	    }
	}


	

	public ResponseEntity<byte[]> printSlieExcelreport(int id, int userId) {

	    try {
	        // ===== FETCH DATA =====
	        ResponseDTO<IssueMenuToLocationDTO> response = issueMenuToLocationUserTabList(id);
	        IssueMenuToLocationDTO menuData = response.getData();

	        if (menuData == null || menuData.getMenuDetail() == null || menuData.getMenuDetail().isEmpty()) {
	            return ResponseEntity.badRequest().body("No records found".getBytes());
	        }

	        SimpleDateFormat sdf = new SimpleDateFormat("dd-MM-yyyy");

	        // ===== WORKBOOK =====
	        HSSFWorkbook workbook = new HSSFWorkbook();
	        HSSFSheet sheet = workbook.createSheet(menuData.getName());
	        sheet.createFreezePane(0, 7);

	        // ===== STYLES =====
	        Font boldWhite = workbook.createFont();
	        boldWhite.setBold(true);
	        boldWhite.setColor(IndexedColors.WHITE.getIndex());

	        CellStyle headerStyle = workbook.createCellStyle();
	        headerStyle.setFont(boldWhite);
	        headerStyle.setAlignment(HorizontalAlignment.CENTER);
	        headerStyle.setVerticalAlignment(VerticalAlignment.CENTER);
	        headerStyle.setFillForegroundColor(IndexedColors.BLUE.getIndex());
	        headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
	        headerStyle.setBorderBottom(BorderStyle.THIN);
	        headerStyle.setBorderTop(BorderStyle.THIN);
	        headerStyle.setBorderLeft(BorderStyle.THIN);
	        headerStyle.setBorderRight(BorderStyle.THIN);

	        CellStyle leftStyle = workbook.createCellStyle();
	        leftStyle.setAlignment(HorizontalAlignment.LEFT);
	        leftStyle.setBorderBottom(BorderStyle.THIN);

	        int rowCount = 0;
	        Row row;
	        Cell cell;

	        // ===== TITLE =====
	        row = sheet.createRow(rowCount++);
	        cell = row.createCell(0);
	        cell.setCellValue("Menu Details");
	        cell.setCellStyle(headerStyle);
	        sheet.addMergedRegion(new CellRangeAddress(0, 0, 0, 9));

	        // ===== MENU INFO =====
	        row = sheet.createRow(rowCount++);
	        row.createCell(0).setCellValue("Menu Name:");
	        row.createCell(1).setCellValue(menuData.getName());
	        sheet.addMergedRegion(new CellRangeAddress(1, 1, 1, 4));

	        row = sheet.createRow(rowCount++);
	        row.createCell(0).setCellValue("Generated By:");
	        row.createCell(1).setCellValue(getApproverName(userId));
	        sheet.addMergedRegion(new CellRangeAddress(2, 2, 1, 4));

	        row = sheet.createRow(rowCount++);
	        row.createCell(0).setCellValue("Generated Date:");
	        row.createCell(1).setCellValue(sdf.format(new Date()));
	        sheet.addMergedRegion(new CellRangeAddress(3, 3, 1, 4));

	        row = sheet.createRow(rowCount++);
	        row.createCell(0).setCellValue("POB:");
	        row.createCell(1).setCellValue(menuData.getPob());
	        row.createCell(2).setCellValue("Total Cost:");
	        row.createCell(3).setCellValue(menuData.getTotalCost());

	        rowCount += 2; // space before table

	        // ===== TABLE HEADER =====
	        row = sheet.createRow(rowCount++);
	        String[] headers = {
	            "Meal Type", "Category", "Recipe",
	            "Portion Size", "UOM",
	            "Cost / Portion", "POB",
	            "POB %", "Final Qty", "Total Cost"
	        };

	        for (int i = 0; i < headers.length; i++) {
	            cell = row.createCell(i);
	            cell.setCellValue(headers[i]);
	            cell.setCellStyle(headerStyle);
	            sheet.setColumnWidth(i, 5000);
	        }
	        
	        double grandTotal = 0.0;

	        // ===== DATA (Grouped by Meal Type) =====
	        Map<String, List<IssueMenuToLocationDTO>> grouped =
	                menuData.getMenuDetail().stream()
	                        .filter(d -> d.getRecipeName() != null && !d.getRecipeName().trim().isEmpty())
	                        .collect(Collectors.groupingBy(IssueMenuToLocationDTO::getMealTypeName));

	        for (Map.Entry<String, List<IssueMenuToLocationDTO>> entry : grouped.entrySet()) {

	            String mealType = entry.getKey();
	            List<IssueMenuToLocationDTO> list = entry.getValue();

	            int startRow = rowCount;
	            int endRow = startRow + list.size() - 1;
	            boolean first = true;

	            double mealSubtotal = 0;   // 🔥 SUBTOTAL for this meal type

	            for (IssueMenuToLocationDTO d : list) {
	                row = sheet.createRow(rowCount);

	                if (first) {
	                    if (startRow < endRow) {
	                        sheet.addMergedRegion(new CellRangeAddress(startRow, endRow, 0, 0));
	                    }
	                    row.createCell(0).setCellValue(mealType);
	                    first = false;
	                }

	                row.createCell(1).setCellValue(d.getCategoryName());
	                row.createCell(2).setCellValue(d.getRecipeName());
	                row.createCell(3).setCellValue(d.getPortionSize());
	                row.createCell(4).setCellValue(d.getUom());
	                row.createCell(5).setCellValue(d.getPerPortionCost());
	                row.createCell(6).setCellValue(menuData.getPob());
	                row.createCell(7).setCellValue(d.getPobParticipation());

	                double finalQty = menuData.getPob() * d.getPobParticipation() / 100.0;
	                row.createCell(8).setCellValue(finalQty);

	                row.createCell(9).setCellValue(d.getTotalCost());

	                mealSubtotal += d.getTotalCost();   // ✅ add to subtotal
	                rowCount++;
	            }

	            // 🔶 SUBTOTAL ROW
	            row = sheet.createRow(rowCount++);
	            row.createCell(8).setCellValue("Subtotal");
	            row.createCell(9).setCellValue(mealSubtotal);

	            grandTotal += mealSubtotal;   // ✅ add to grand total
	        }
	        row = sheet.createRow(rowCount++);
	        row.createCell(8).setCellValue("Grand Total");
	        row.createCell(9).setCellValue(grandTotal);
	        



	        // ===== WRITE RESPONSE =====
	        ByteArrayOutputStream out = new ByteArrayOutputStream();
	        workbook.write(out);
	        workbook.close();

	        HttpHeaders headersResp = new HttpHeaders();
	        headersResp.setContentType(MediaType.parseMediaType("application/vnd.ms-excel"));
	        headersResp.set(HttpHeaders.CONTENT_DISPOSITION,
	                "attachment; filename=Menu_" + id + ".xls");

	        return new ResponseEntity<>(out.toByteArray(), headersResp, HttpStatus.OK);

	    } catch (Exception e) {
	        e.printStackTrace();
	        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
	                .body(("Excel error: " + e.getMessage()).getBytes());
	    }
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

	public ResponseDTO<List<ComboBoxDTO>> loadUserLocationDropDown(int userFk) {

		ResponseDTO<List<ComboBoxDTO>> response = new ResponseDTO<>();
		List<ComboBoxDTO> comboList = new ArrayList<>();

		try {
			List<MstLocationUserMappingHib> locationList = mstLocationUserMappingRepository.findLocation(userFk);

			if (locationList == null || locationList.isEmpty()) {
				response.setSuccess(AppConstants.FALSE);
				response.setMessage("No locations mapped for this user.");
				return response;
			}

			comboList = locationList.stream().map(loc -> mstLoctionMenuRepository.retrieveLocation(loc.getLocationId()))
					.filter(Objects::nonNull).map(location -> {
						ComboBoxDTO dto = new ComboBoxDTO();
						dto.setPk(location.getLocationPk());
						dto.setCode(location.getLocationId());
						dto.setName(location.getLocationName());
						return dto;
					}).toList();

			response.setSuccess(AppConstants.TRUE);
			response.setData(comboList);
			response.setMessage("Location list loaded successfully.");

		} catch (RestException re) {
			response.setSuccess(AppConstants.FALSE);
			response.setMessage("Error while fetching user location.");
			log.warn(AppConstants.REST_EXCEPTION + " - Location List", re);

		} catch (Exception e) {
			response.setSuccess(AppConstants.FALSE);
			response.setMessage("Internal server error.");
			log.error(AppConstants.EXCEPTION + " --- LocationList", e);
		}

		return response;
	}

	@Transactional
	public ResponseDTO<IssueMenuToLocationDTO> updateIssuedMenu(IssueMenuToLocationDTO dto) {

		ResponseDTO<IssueMenuToLocationDTO> response = new ResponseDTO<>();

		try {
			// ===================== 1. UPDATE MASTER =====================
			IssueMenuMHib master = issueMenuMRepository.findById(dto.getId());
			if (master == null) {
				response.setSuccess(AppConstants.FALSE);
				response.setMessage("Issue Menu not found");
				return response;
			}

			SimpleDateFormat sdf = new SimpleDateFormat(DATE_FORMAT);

			master.setMenuDate(dto.getMenuIssuedDate() != null ? sdf.format(dto.getMenuIssuedDate()) : null);
			master.setPob(dto.getPob());
			master.setActualPob(dto.getPob());
			master.setNotes(dto.getNotes());
			master.setTotal(dto.getTotalCost());
			master.setLastActBy(dto.getCreatedBy());
			master.setLastActDateTime(new Date());

			issueMenuMRepository.save(master);

			// ===================== 2. FETCH EXISTING HEADERS =====================
			List<IssueMenuHHib> headers = issueMenuHRepository.findByMenuMFk(master.getId());

			for (IssueMenuHHib header : headers) {

				// ===================== 3. DELETE OLD D & I =====================
				issueMenuIRepository.deleteByIssueMenuHFk(header.getId());
				issueMenuDRepository.deleteByIssueMenuHFk(header.getId());

				// ===================== 4. FILTER menuDetail FOR THIS HEADER
				// =====================
				List<IssueMenuToLocationDTO> rows = dto.getMenuDetail().stream()
						.filter(d -> d.getMenuFk() == header.getMenuFk() && d.getMealTypeFk() == header.getMealTypeFk())
						.toList();

				double headerTotal = 0.0;
				int recipeCount = 0;
				Set<Integer> categorySet = new HashSet<>();

				// ===================== 5. INSERT NEW D & I =====================
				for (IssueMenuToLocationDTO row : rows) {

					if (row.getRecipeFk() == 0) {
						continue; // empty slot
					}

					RecipeHHib recipe = recipeHRepository.findByRecipeFk(row.getRecipeFk());
					if (recipe == null) {
						throw new RuntimeException("Recipe not found : " + row.getRecipeFk());
					}

					IssueMenuDHib d = new IssueMenuDHib();

					d.setIssueMenuMFk(master.getId());
					d.setIssueMenuHFk(header.getId());
					d.setMenuFk(row.getMenuFk());

					d.setCategoryFk(row.getCategoryFk());
					d.setCategoryName(row.getCategoryName());

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

					d.setPerPortionCost(recipe.getPerPortionCost());

					d.setPobParticipation(row.getPobParticipation());
					d.setActualPobParticipation(row.getPobParticipation());

					double cost = master.getActualPob() * row.getPobParticipation() / 100 * recipe.getPerPortionCost();

					d.setTotalCost(cost);

					d.setStatus(AppConstants.FLAG_A);
					d.setCreatedBy(dto.getCreatedBy());
					d.setCreatedDateTime(new Date());
					d.setLastActBy(dto.getCreatedBy());
					d.setLastActDateTime(new Date());
					d.setMenuDate(master.getMenuDate());

					issueMenuDRepository.save(d);

					headerTotal += recipe.getPerPortionCost();
					recipeCount++;
					categorySet.add(row.getCategoryFk());

					// ---------- I ----------
					List<RecipeDHib> ingredients = recipeDRepository.findByActRecipe(recipe.getId());

					for (RecipeDHib ing : ingredients) {

						IssueMenuIHib i = new IssueMenuIHib();

						i.setIssueMenuMFk(master.getId());
						i.setIssueMenuHFk(header.getId());
						i.setIssueMenuDFk(d.getId());

						i.setMenuFk(row.getMenuFk());
						i.setMenuDFk(0); // not applicable in update

						i.setRecipeFk(recipe.getId());

						i.setCategoryFk(ing.getCategoryFk());
						i.setCategoryName(ing.getCategoryName());

						i.setItemFk(ing.getItemFk());
						i.setItemCode(ing.getItemCode());
						i.setItemName(ing.getItemName());

						i.setPackageId(ing.getPackageId());
						i.setPackagePrice(ing.getPackagePrice());
						i.setPackageBaseFactor(ing.getPackageBaseFactor());
						i.setPackageSecondaryFactor(ing.getPackageSecondaryFactor());
						i.setPackageBaseUnit(ing.getPackageBaseUnit());
						i.setPackageSecondaryUnit(ing.getPackageSecondaryUnit());
						i.setPackageSecondaryCost(ing.getPackageSecondaryCost());

						i.setBaseQuantity(ing.getBaseQuantity() / recipe.getBaseQuantity());
						i.setSecondaryQuantity(ing.getSecondaryQuantity() / recipe.getBaseQuantity());
						i.setTotal(ing.getTotal() / recipe.getBaseQuantity());

						i.setPobParticipation(row.getPobParticipation());

						i.setStatus(AppConstants.FLAG_A);
						i.setCreatedBy(dto.getCreatedBy());
						i.setCreatedDateTime(new Date());
						i.setLastActBy(dto.getCreatedBy());
						i.setLastActDateTime(new Date());
						i.setMenuDate(master.getMenuDate());

						issueMenuIRepository.save(i);

					}
				}

				// ===================== 6. UPDATE HEADER TOTALS =====================
				header.setTotalCost(headerTotal);
				header.setRecipeCount(recipeCount);
				header.setCategoryCount(categorySet.size());
				header.setLastActBy(dto.getCreatedBy());
				header.setLastActDateTime(new Date());

				issueMenuHRepository.save(header);
			}

			response.setSuccess(AppConstants.TRUE);
			response.setMessage("Issued Menu updated successfully");

		} catch (Exception e) {
			log.error("Error updating Issued Menu", e);
			response.setSuccess(AppConstants.FALSE);
			response.setMessage(AppConstants.EXCEPTION);
		}

		return response;
	}

}
