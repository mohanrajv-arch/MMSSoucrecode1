package esfita.service;

import java.io.ByteArrayOutputStream;
import java.math.RoundingMode;
import java.nio.charset.StandardCharsets;
import java.text.DecimalFormat;
import java.text.NumberFormat;
import java.text.SimpleDateFormat;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.Comparator;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.TreeMap;
import java.util.TreeSet;
import java.util.stream.Collectors;

import org.apache.poi.hssf.usermodel.HSSFSheet;
import org.apache.poi.hssf.usermodel.HSSFWorkbook;
import org.apache.poi.ss.usermodel.BorderStyle;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.Font;
import org.apache.poi.ss.usermodel.HorizontalAlignment;
import org.apache.poi.ss.usermodel.IndexedColors;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.util.CellRangeAddress;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import esfita.common.AppConstants;
import esfita.common.ComboBoxDTO;
import esfita.common.ResponseDTO;
import esfita.dto.ItemRequisitionDTO;
import esfita.entity.EstimatedDHib;
import esfita.entity.EstimatedHHib;
import esfita.entity.IssueMenuHHib;
import esfita.entity.IssueMenuIHib;
import esfita.entity.IssueMenuMHib;
import esfita.entity.ItemReqDHib;
import esfita.entity.ItemReqHHib;
import esfita.entity.MstItemCategoryHib;
import esfita.entity.MstLocationMenuHib;
import esfita.repository.EstimatedDRepository;
import esfita.repository.EstimatedHRepository;
import esfita.repository.IssueMenuHRepository;
import esfita.repository.IssueMenuIRepository;
import esfita.repository.IssueMenuMRepository;
import esfita.repository.ItemMasterRepository;
import esfita.repository.ItemReqDRepository;
import esfita.repository.ItemReqHRepository;
import esfita.repository.MstItemCategoryRepository;
import esfita.repository.MstLocationMenuRepository;
import esfita.repository.MstUserRepository;
import esfita.utils.RestException;
import lombok.extern.log4j.Log4j2;

@Service
@Log4j2
public class ItemRequisitionService {

	private final EstimatedHRepository estimatedHRepository;

	@Autowired
	private ItemMasterRepository itemMasterRepository;
	@Autowired
	private IssueMenuHRepository issueMenuHRepository;
	@Autowired
	private IssueMenuMRepository issueMenuMRepository;
	@Autowired
	private IssueMenuIRepository issueMenuIRepository;
	@Autowired
	private MstLocationMenuRepository mstLoctionMenuRepository;
	@Autowired
	private ItemReqDRepository itemReqDRepository;
	@Autowired
	private ItemReqHRepository itemReqHRepository;
	@Autowired
	private MstItemCategoryRepository mstItemCategoryRepository;
	@Autowired
	private EstimatedDRepository estimatedDRepository;
	@Autowired
	private MstUserRepository mstUserRepository;

	private static final Logger log = LoggerFactory.getLogger(ItemRequisitionService.class);

	ItemRequisitionService(EstimatedHRepository estimatedHRepository) {
		this.estimatedHRepository = estimatedHRepository;
	}

	// ==============================================================================================================

//	public ResponseDTO<ItemRequisitionDTO> itemReqList(ItemRequisitionDTO itemRequisitionDTO) {
//		ResponseDTO<ItemRequisitionDTO> response = new ResponseDTO<>();
//
//		try {
//			int locationFk = itemRequisitionDTO.getLocationFk();
//			SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
//
//			String singleDate = itemRequisitionDTO.getSingleDates() != null
//					? sdf.format(itemRequisitionDTO.getSingleDates())
//					: null;
//			String fromDate = itemRequisitionDTO.getFromDates() != null ? sdf.format(itemRequisitionDTO.getFromDates())
//					: null;
//			String toDate = itemRequisitionDTO.getToDates() != null ? sdf.format(itemRequisitionDTO.getToDates())
//					: null;
//
//			List<IssueMenuMHib> issueMenuMList = issueMenuMRepository.findMenus(locationFk, singleDate, fromDate,
//					toDate);
//
//			Set<String> distinctDays = new HashSet<>();
//			Set<String> distinctItems = new HashSet<>();
//			int totalMenus = 0;
//			double totalCost = 0.0;
//
//			List<ItemRequisitionDTO> menuList = new ArrayList<>();
//			List<ItemRequisitionDTO> overallItemList = new ArrayList<>();
//			Map<String, List<ItemRequisitionDTO>> dateWiseItemList = new LinkedHashMap<>();
//
//			Map<String, ItemRequisitionDTO> overallItemMap = new HashMap<>();
//			Map<String, Map<String, ItemRequisitionDTO>> dateWiseItemMap = new TreeMap<>();
//			Set<String> menuFkSet = new HashSet<>();
//
//			double totalPob = 0;
//
//			if (issueMenuMList != null && !issueMenuMList.isEmpty()) {
//				for (IssueMenuMHib menuMEntity : issueMenuMList) {
//					menuFkSet.add(String.valueOf(menuMEntity.getId()));
//
//					if (menuMEntity.getMenuDate() != null) {
//						distinctDays.add(menuMEntity.getMenuDate());
//						totalPob += menuMEntity.getActualPob();
//					}
//
//					// ---------- MENUS ----------
//					List<IssueMenuHHib> issueMenuHList = issueMenuHRepository.findByMenuMFk(menuMEntity.getId());
//					if (issueMenuHList != null && !issueMenuHList.isEmpty()) {
//						for (IssueMenuHHib menuHEntity : issueMenuHList) {
//							totalMenus++;
//							ItemRequisitionDTO menuDto = new ItemRequisitionDTO();
//							menuDto.setId(menuHEntity.getId());
//							menuDto.setMealTypeFk(menuHEntity.getMealTypeFk());
//							menuDto.setMealType(menuHEntity.getMealTypeName());
//							menuDto.setMenuFk(menuHEntity.getMenuFk());
//							menuDto.setFinalMenuName(menuMEntity.getName());
//							menuDto.setMenuName(menuHEntity.getMenuName());
//							menuDto.setDate(menuHEntity.getMenuDate());
//							menuDto.setPob(menuMEntity.getActualPob());
//							int itemCount = issueMenuIRepository.uniqueItemCountByMenuM(menuHEntity.getId());
//							menuDto.setItemCount(itemCount);
//							menuList.add(menuDto);
//						}
//					}
//
//					// ---------- ITEMS ----------
//					List<IssueMenuIHib> issueMenuIList = issueMenuIRepository
//							.findUniqueItemsByMenuM(menuMEntity.getId());
//
//					if (issueMenuIList != null && !issueMenuIList.isEmpty()) {
//						for (IssueMenuIHib issueItemEntity : issueMenuIList) {
//							String itemCode = issueItemEntity.getItemCode();
//							String date = issueItemEntity.getMenuDate();
//
//							// ---------- OVERALL AGGREGATION ----------
//							overallItemMap.compute(itemCode, (k, existing) -> {
//								if (existing == null) {
//									ItemRequisitionDTO dto = new ItemRequisitionDTO();
//									dto.setItemCategoryFk(issueItemEntity.getCategoryFk());
//									dto.setItemCategoryName(issueItemEntity.getCategoryName());
//									dto.setItemFk(issueItemEntity.getItemFk());
//									dto.setItemName(issueItemEntity.getItemName());
//									dto.setItemCode(itemCode);
//									dto.setPackageId(issueItemEntity.getPackageId());
//									dto.setPackagePrice(issueItemEntity.getPackagePrice());
//
//									dto.setPackageBaseFactor(issueItemEntity.getPackageBaseFactor());
//									dto.setPackageSecondaryFactor(issueItemEntity.getPackageSecondaryFactor());
//
//									dto.setPackageBaseUnit(issueItemEntity.getPackageBaseUnit());
//									dto.setPackageSecondaryUnit(issueItemEntity.getPackageSecondaryUnit());
//									dto.setPackageSecondaryCost(issueItemEntity.getPackageSecondaryCost());
//
//									dto.setChefUnit(issueItemEntity.getPackageSecondaryUnit());
//									dto.setCostPrice(issueItemEntity.getPackageSecondaryCost());
//
//									dto.setBaseQuantity(issueItemEntity.getBaseQuantity() * menuMEntity.getActualPob()
//											* issueItemEntity.getPobParticipation() / 100.0);
//									dto.setSecondaryQuantity(
//											issueItemEntity.getSecondaryQuantity() * menuMEntity.getActualPob()
//													* issueItemEntity.getPobParticipation() / 100.0);
//									dto.setBaseTotal(issueItemEntity.getTotal() * menuMEntity.getActualPob()
//											* issueItemEntity.getPobParticipation() / 100.0);
//									dto.setDate(date);
//									return dto;
//								} else {
//									existing.setBaseQuantity(existing.getBaseQuantity()
//											+ (issueItemEntity.getBaseQuantity() * menuMEntity.getActualPob()
//													* issueItemEntity.getPobParticipation() / 100.0));
//									existing.setSecondaryQuantity(existing.getSecondaryQuantity()
//											+ (issueItemEntity.getSecondaryQuantity() * menuMEntity.getActualPob()
//													* issueItemEntity.getPobParticipation() / 100.0));
//									existing.setBaseTotal(existing.getBaseTotal()
//											+ (issueItemEntity.getTotal() * menuMEntity.getActualPob()
//													* issueItemEntity.getPobParticipation() / 100.0));
//									return existing;
//								}
//							});
//
//							// ---------- DATE-WISE AGGREGATION ----------
//							dateWiseItemMap.computeIfAbsent(date, d -> new LinkedHashMap<>()).compute(itemCode,
//									(k, existing) -> {
//										if (existing == null) {
//											ItemRequisitionDTO dto = new ItemRequisitionDTO();
//											dto.setItemCategoryFk(issueItemEntity.getCategoryFk());
//											dto.setItemCategoryName(issueItemEntity.getCategoryName());
//											dto.setItemFk(issueItemEntity.getItemFk());
//											dto.setItemName(issueItemEntity.getItemName());
//											dto.setItemCode(itemCode);
//											dto.setPackageId(issueItemEntity.getPackageId());
//											dto.setPackagePrice(issueItemEntity.getPackagePrice());
//											dto.setPackageBaseFactor(issueItemEntity.getPackageBaseFactor());
//											dto.setPackageSecondaryFactor(issueItemEntity.getPackageSecondaryFactor());
//											dto.setPackageBaseUnit(issueItemEntity.getPackageBaseUnit());
//											dto.setPackageSecondaryUnit(issueItemEntity.getPackageSecondaryUnit());
//											dto.setPackageSecondaryCost(issueItemEntity.getPackageSecondaryCost());
//											dto.setChefUnit(issueItemEntity.getPackageSecondaryUnit());
//											dto.setCostPrice(issueItemEntity.getPackageSecondaryCost());
//
//											dto.setBaseQuantity(
//													issueItemEntity.getBaseQuantity() * menuMEntity.getActualPob()
//															* issueItemEntity.getPobParticipation() / 100.0);
//											dto.setSecondaryQuantity(
//													issueItemEntity.getSecondaryQuantity() * menuMEntity.getActualPob()
//															* issueItemEntity.getPobParticipation() / 100.0);
//											dto.setBaseTotal(issueItemEntity.getTotal() * menuMEntity.getActualPob()
//													* issueItemEntity.getPobParticipation() / 100.0);
//											dto.setDate(date);
//											return dto;
//										} else {
//											existing.setBaseQuantity(existing.getBaseQuantity()
//													+ (issueItemEntity.getBaseQuantity() * menuMEntity.getActualPob()
//															* issueItemEntity.getPobParticipation() / 100.0));
//											existing.setSecondaryQuantity(existing.getSecondaryQuantity()
//													+ (issueItemEntity.getSecondaryQuantity()
//															* menuMEntity.getActualPob()
//															* issueItemEntity.getPobParticipation() / 100.0));
//											existing.setBaseTotal(existing.getBaseTotal()
//													+ (issueItemEntity.getTotal() * menuMEntity.getActualPob()
//															* issueItemEntity.getPobParticipation() / 100.0));
//											return existing;
//										}
//									});
//
//							distinctItems.add(itemCode);
//							totalCost += issueItemEntity.getTotal();
//						}
//					}
//				}
//
//				overallItemList.addAll(overallItemMap.values());
//
//				for (Map.Entry<String, Map<String, ItemRequisitionDTO>> entry : dateWiseItemMap.entrySet()) {
//					List<ItemRequisitionDTO> sortedItems = new ArrayList<>(entry.getValue().values());
//
//					sortedItems.sort(Comparator.comparing(ItemRequisitionDTO::getItemName));
//					dateWiseItemList.put(entry.getKey(), sortedItems);
//				}
//
//				String menuFkStr = String.join(",", menuFkSet);
//
//				ItemRequisitionDTO summaryDto = new ItemRequisitionDTO();
//				summaryDto.setMenuList(menuList);
//				summaryDto.setItemList(overallItemList);
//				summaryDto.setDateWiseItemList(dateWiseItemList);
//				summaryDto.setTotalDays(distinctDays.size());
//				summaryDto.setTotalItems(distinctItems.size());
//				summaryDto.setTotalMeals(totalMenus);
//				summaryDto.setMenuItemCost(totalCost);
//				summaryDto.setMenuFkStr(menuFkStr);
//				summaryDto.setTotalPob(totalPob);
//
//				response.setData(summaryDto);
//				response.setSuccess(AppConstants.TRUE);
//				response.setMessage(AppConstants.MSG_RECORD_FETCHED);
//
//			} else {
//				response.setSuccess(AppConstants.FALSE);
//				response.setMessage(AppConstants.IS_EMPTY);
//			}
//
//		} catch (Exception e) {
//			response.setSuccess(AppConstants.FALSE);
//			response.setMessage("Exception in itemRequisitionList");
//			log.error("Error in itemRequisitionList", e);
//		}
//
//		return response;
//	}
	public ResponseDTO<ItemRequisitionDTO> itemReqList(ItemRequisitionDTO itemRequisitionDTO) {
		ResponseDTO<ItemRequisitionDTO> response = new ResponseDTO<>();

		try {
			int locationFk = itemRequisitionDTO.getLocationFk();
			SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");

			String singleDate = itemRequisitionDTO.getSingleDates() != null
					? sdf.format(itemRequisitionDTO.getSingleDates())
					: null;
			String fromDate = itemRequisitionDTO.getFromDates() != null ? sdf.format(itemRequisitionDTO.getFromDates())
					: null;
			String toDate = itemRequisitionDTO.getToDates() != null ? sdf.format(itemRequisitionDTO.getToDates())
					: null;

			List<IssueMenuMHib> issueMenuMList = issueMenuMRepository.findMenus(locationFk, singleDate, fromDate,
					toDate);

			Set<String> distinctDays = new HashSet<>();
			Set<String> distinctItems = new HashSet<>();
			int totalMenus = 0;
			double totalCost = 0.0;
			double totalPob = 0;

			List<ItemRequisitionDTO> menuList = new ArrayList<>();
			List<ItemRequisitionDTO> overallItemList = new ArrayList<>();
			Map<String, List<ItemRequisitionDTO>> dateWiseItemList = new LinkedHashMap<>();

			Map<String, ItemRequisitionDTO> overallItemMap = new HashMap<>();
			Map<String, Map<String, ItemRequisitionDTO>> dateWiseItemMap = new TreeMap<>();
			Set<String> menuFkSet = new HashSet<>();

			if (issueMenuMList != null && !issueMenuMList.isEmpty()) {

				for (IssueMenuMHib menuMEntity : issueMenuMList) {

					menuFkSet.add(String.valueOf(menuMEntity.getId()));

					if (menuMEntity.getMenuDate() != null) {
						distinctDays.add(menuMEntity.getMenuDate());
						totalPob += menuMEntity.getActualPob();
					}

					List<IssueMenuHHib> issueMenuHList = issueMenuHRepository.findByMenuMFk(menuMEntity.getId());

					if (issueMenuHList == null || issueMenuHList.isEmpty()) {
						continue;
					}

					for (IssueMenuHHib menuHEntity : issueMenuHList) {

						totalMenus++;

						ItemRequisitionDTO menuDto = new ItemRequisitionDTO();
						menuDto.setId(menuHEntity.getId());
						menuDto.setMealTypeFk(menuHEntity.getMealTypeFk());
						menuDto.setMealType(menuHEntity.getMealTypeName());
						menuDto.setMenuFk(menuHEntity.getMenuFk());
						menuDto.setFinalMenuName(menuMEntity.getName());
						menuDto.setMenuName(menuHEntity.getMenuName());
						menuDto.setDate(menuHEntity.getMenuDate());
						menuDto.setPob(menuMEntity.getActualPob());

						// ✅ meal-type–wise item count
						Set<String> menuDistinctItems = new HashSet<>();

						// ✅ IMPORTANT: fetch items by MENU-H (meal type)
						List<IssueMenuIHib> issueMenuIList = issueMenuIRepository.findItemsByMenuH(menuHEntity.getId());

						if (issueMenuIList != null && !issueMenuIList.isEmpty()) {

							for (IssueMenuIHib issueItemEntity : issueMenuIList) {

								double factor = menuMEntity.getActualPob() * issueItemEntity.getPobParticipation()
										/ 100.0;

								double finalSecondaryQty = issueItemEntity.getSecondaryQuantity() * factor;

								// ✅ FINAL FILTER (applies everywhere)
								if (Math.abs(finalSecondaryQty) < 0.0001) {
									continue;
								}

								String itemCode = issueItemEntity.getItemCode();
								String date = issueItemEntity.getMenuDate();

								menuDistinctItems.add(itemCode);
								distinctItems.add(itemCode);

								totalCost += issueItemEntity.getTotal() * factor;

								// ---------- OVERALL AGGREGATION ----------
								overallItemMap.compute(itemCode, (k, existing) -> {
									if (existing == null) {
										ItemRequisitionDTO dto = new ItemRequisitionDTO();
										dto.setItemCategoryFk(issueItemEntity.getCategoryFk());
										dto.setItemCategoryName(issueItemEntity.getCategoryName());
										dto.setItemFk(issueItemEntity.getItemFk());
										dto.setItemName(issueItemEntity.getItemName());
										dto.setItemCode(itemCode);
										dto.setPackageId(issueItemEntity.getPackageId());
										dto.setPackagePrice(issueItemEntity.getPackagePrice());
										dto.setPackageBaseFactor(issueItemEntity.getPackageBaseFactor());
										dto.setPackageSecondaryFactor(issueItemEntity.getPackageSecondaryFactor());
										dto.setPackageBaseUnit(issueItemEntity.getPackageBaseUnit());
										dto.setPackageSecondaryUnit(issueItemEntity.getPackageSecondaryUnit());
										dto.setPackageSecondaryCost(issueItemEntity.getPackageSecondaryCost());
										dto.setChefUnit(issueItemEntity.getPackageSecondaryUnit());
										dto.setCostPrice(issueItemEntity.getPackageSecondaryCost());
										dto.setBaseQuantity(issueItemEntity.getBaseQuantity() * factor);
										dto.setSecondaryQuantity(issueItemEntity.getSecondaryQuantity() * factor);
										dto.setBaseTotal(issueItemEntity.getTotal() * factor);
										dto.setDate(date);
										return dto;
									} else {
										existing.setBaseQuantity(existing.getBaseQuantity()
												+ issueItemEntity.getBaseQuantity() * factor);
										existing.setSecondaryQuantity(existing.getSecondaryQuantity()
												+ issueItemEntity.getSecondaryQuantity() * factor);
										existing.setBaseTotal(
												existing.getBaseTotal() + issueItemEntity.getTotal() * factor);
										return existing;
									}
								});

								// ---------- DATE-WISE AGGREGATION ----------
								dateWiseItemMap.computeIfAbsent(date, d -> new LinkedHashMap<>()).compute(itemCode,
										(k, existing) -> {
											if (existing == null) {
												ItemRequisitionDTO dto = new ItemRequisitionDTO();
												dto.setItemCategoryFk(issueItemEntity.getCategoryFk());
												dto.setItemCategoryName(issueItemEntity.getCategoryName());
												dto.setItemFk(issueItemEntity.getItemFk());
												dto.setItemName(issueItemEntity.getItemName());
												dto.setItemCode(itemCode);
												dto.setPackageId(issueItemEntity.getPackageId());
												dto.setPackagePrice(issueItemEntity.getPackagePrice());
												dto.setPackageBaseFactor(issueItemEntity.getPackageBaseFactor());
												dto.setPackageSecondaryFactor(
														issueItemEntity.getPackageSecondaryFactor());
												dto.setPackageBaseUnit(issueItemEntity.getPackageBaseUnit());
												dto.setPackageSecondaryUnit(issueItemEntity.getPackageSecondaryUnit());
												dto.setPackageSecondaryCost(issueItemEntity.getPackageSecondaryCost());
												dto.setChefUnit(issueItemEntity.getPackageSecondaryUnit());
												dto.setCostPrice(issueItemEntity.getPackageSecondaryCost());
												dto.setBaseQuantity(issueItemEntity.getBaseQuantity() * factor);
												dto.setSecondaryQuantity(
														issueItemEntity.getSecondaryQuantity() * factor);
												dto.setBaseTotal(issueItemEntity.getTotal() * factor);
												dto.setDate(date);
												return dto;
											} else {
												existing.setBaseQuantity(existing.getBaseQuantity()
														+ issueItemEntity.getBaseQuantity() * factor);
												existing.setSecondaryQuantity(existing.getSecondaryQuantity()
														+ issueItemEntity.getSecondaryQuantity() * factor);
												existing.setBaseTotal(
														existing.getBaseTotal() + issueItemEntity.getTotal() * factor);
												return existing;
											}
										});
							}
						}

						// ✅ SET MEAL-TYPE ITEM COUNT (JAVA)
						menuDto.setItemCount(menuDistinctItems.size());
						menuList.add(menuDto);
					}
				}

				// ---------- FINAL FILTER (DOUBLE SAFETY) ----------
				overallItemList.addAll(overallItemMap.values());
				overallItemList.removeIf(dto -> Math.abs(dto.getSecondaryQuantity()) < 0.0001);

				for (Map.Entry<String, Map<String, ItemRequisitionDTO>> entry : dateWiseItemMap.entrySet()) {
					List<ItemRequisitionDTO> filtered = entry.getValue().values().stream()
							.filter(dto -> Math.abs(dto.getSecondaryQuantity()) >= 0.0001)
							.sorted(Comparator.comparing(ItemRequisitionDTO::getItemName)).collect(Collectors.toList());

					dateWiseItemList.put(entry.getKey(), filtered);
				}

				ItemRequisitionDTO summaryDto = new ItemRequisitionDTO();
				summaryDto.setMenuList(menuList);
				summaryDto.setItemList(overallItemList);
				summaryDto.setDateWiseItemList(dateWiseItemList);
				summaryDto.setTotalDays(distinctDays.size());
				summaryDto.setTotalItems(distinctItems.size());
				summaryDto.setTotalMeals(totalMenus);
				summaryDto.setMenuItemCost(totalCost);
				summaryDto.setMenuFkStr(String.join(",", menuFkSet));
				summaryDto.setTotalPob(totalPob);

				response.setData(summaryDto);
				response.setSuccess(AppConstants.TRUE);
				response.setMessage(AppConstants.MSG_RECORD_FETCHED);

			} else {
				response.setSuccess(AppConstants.FALSE);
				response.setMessage(AppConstants.IS_EMPTY);
			}

		} catch (Exception e) {
			response.setSuccess(AppConstants.FALSE);
			response.setMessage("Exception in itemRequisitionList");
			log.error("Error in itemRequisitionList", e);
		}

		return response;
	}

	public ResponseDTO<List<ComboBoxDTO>> loadItemDropdown() {

		ResponseDTO<List<ComboBoxDTO>> response = new ResponseDTO<>();
		List<ComboBoxDTO> comboList = new ArrayList<>();

		try {

			List<ItemDropdownProjection> list = itemMasterRepository.loadItemDropdownFast();

			for (ItemDropdownProjection p : list) {
				ComboBoxDTO dto = new ComboBoxDTO();

				dto.setPk(p.getId());
				dto.setItemCategoryFk(p.getCategoryFk());
				dto.setCategory(p.getCategoryName());

				dto.setCode(p.getItemCode());
				dto.setName(p.getItemName());

				dto.setPackageId(p.getPackageId());
				dto.setPackagePrice(p.getPackagePrice());

				dto.setPackageBaseFactor(p.getPackageBaseFactor());
				dto.setPackageSecondaryFactor(p.getPackageSecondaryFactor());

				dto.setPackageBaseUnit(p.getPackageBaseUnit());
				dto.setPackageSecondaryUnit(p.getPackageSecondaryUnit());
				dto.setPackageSecondaryCost(p.getPackageSecondaryCost());

				dto.setChefUnit(p.getPackageSecondaryUnit());
				dto.setChefCost(p.getPackageSecondaryCost());

				comboList.add(dto);
			}

			response.setData(comboList);
			response.setSuccess(AppConstants.TRUE);

		} catch (Exception e) {
			response.setSuccess(AppConstants.FALSE);
			response.setMessage("Error loading items");
		}

		return response;
	}

	public interface ItemDropdownProjection {
		int getId();

		int getCategoryFk();

		String getCategoryName();

		String getItemCode();

		String getItemName();

		String getPackageId();

		Double getPackagePrice();

		Double getPackageBaseFactor();

		Double getPackageSecondaryFactor();

		String getPackageBaseUnit();

		String getPackageSecondaryUnit();

		Double getPackageSecondaryCost();
	}

	public ResponseDTO<List<ComboBoxDTO>> loadLocationName() {
		ResponseDTO<List<ComboBoxDTO>> response = new ResponseDTO<>();
		List<ComboBoxDTO> comboList = new ArrayList<>();
		try {
			List<MstLocationMenuHib> mstLocationList = mstLoctionMenuRepository.orderBy();
			if (mstLocationList != null) {
				for (MstLocationMenuHib hib : mstLocationList) {
					ComboBoxDTO dto = new ComboBoxDTO();
					dto.setPk(hib.getLocationPk());
					dto.setName(hib.getLocationName());
					comboList.add(dto);
				}
			} else {
				response.setSuccess(AppConstants.FALSE);
				response.setMessage(AppConstants.MSG_NO_RECORDS_FOUND);
			}

			response.setData(comboList);
		} catch (RestException re) {
			response.setSuccess(AppConstants.FALSE);
			log.warn(AppConstants.REST_EXCEPTION + " - Location List", re);
		} catch (Exception e) {
			response.setSuccess(AppConstants.FALSE);
			log.error(AppConstants.EXCEPTION + " - Location List", e);
		}
		return response;
	}

	public ResponseDTO<ItemRequisitionDTO> saveItemReq(ItemRequisitionDTO itemRequisitionDTO) {
		ResponseDTO<ItemRequisitionDTO> response = new ResponseDTO<>();
		try {

			ItemReqHHib hib = new ItemReqHHib();

			String finalID = null;
			String ref = generateIDReq();
			ref += "%";
			List<ItemReqHHib> salesHeader = itemReqHRepository.transactionNo(ref);

			if (salesHeader != null && !salesHeader.isEmpty()) {
				finalID = generateIDReq(salesHeader.size() + 1);
			} else {
				finalID = generateIDReq(1);
			}

			hib.setMenuFk(itemRequisitionDTO.getMenuFkStr());
			hib.setLocationFk(itemRequisitionDTO.getLocationFk());
			hib.setReqId(finalID);
			hib.setStatus(AppConstants.FLAG_A);
			if (itemRequisitionDTO.getSingleDates() == null) {
				hib.setFromDate(itemRequisitionDTO.getFromDates());
				hib.setToDate(itemRequisitionDTO.getToDates());
			} else {
				hib.setFromDate(itemRequisitionDTO.getSingleDates());
				hib.setToDate(itemRequisitionDTO.getSingleDates());
			}
			hib.setRemarks(itemRequisitionDTO.getRemarks());
			hib.setCreatedBy(itemRequisitionDTO.getCreatedBy());
			hib.setCreatedDate(new Date());
			hib.setTotalPob(itemRequisitionDTO.getTotalPob());
			itemReqHRepository.save(hib);

			// ---------- SAVE DATE-WISE ITEMS ----------
			if (itemRequisitionDTO.getDateWiseItemList() != null
					&& !itemRequisitionDTO.getDateWiseItemList().isEmpty()) {
				for (Map.Entry<String, List<ItemRequisitionDTO>> entry : itemRequisitionDTO.getDateWiseItemList()
						.entrySet()) {
					String dateStr = entry.getKey();
					List<ItemRequisitionDTO> dailyItems = entry.getValue();

					for (ItemRequisitionDTO obj : dailyItems) {
						ItemReqDHib dHib = new ItemReqDHib();
						dHib.setHeaderFk(hib.getId());

						dHib.setAdditional(0);
						dHib.setReqType(0);

						if (obj.getItemCategoryFk() != null) {
							dHib.setCategoryFk((int) obj.getItemCategoryFk().longValue());
						} else {
							dHib.setCategoryFk(0); // or handle as per your business rule
						}

						dHib.setCategory(obj.getItemCategoryName());
						dHib.setItemCode(obj.getItemCode());
						dHib.setItemName(obj.getItemName());
						dHib.setPackageId(obj.getPackageId());
						dHib.setPackagePrice(obj.getPackagePrice());

						dHib.setPackageBaseUnit(obj.getPackageBaseUnit());
						dHib.setPackageSecondaryUnit(obj.getPackageSecondaryUnit());

						dHib.setPackageBaseFactor(obj.getPackageBaseFactor());
						dHib.setPackageSecondaryFactor(obj.getPackageSecondaryFactor());

						dHib.setPackageSecondaryCost(obj.getPackageSecondaryCost());

						dHib.setChefUnit(obj.getChefUnit());
						dHib.setCostPrice(obj.getCostPrice());

						dHib.setBaseQuantity(obj.getBaseQuantity());
						dHib.setSecondaryQuantity(obj.getSecondaryQuantity());

						dHib.setQuantity(obj.getSecondaryQuantity());
						dHib.setCost(obj.getPackageSecondaryCost() * obj.getSecondaryQuantity());

						// Parse date string
						SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
						Date parsedDate = sdf.parse(dateStr);
						dHib.setDate(parsedDate);

						itemReqDRepository.save(dHib);
					}
				}
			}

			// ---------- SAVE ADDITIONAL ITEMS ----------
			if (itemRequisitionDTO.getAdditionalItems() != null && !itemRequisitionDTO.getAdditionalItems().isEmpty()) {
				for (ItemRequisitionDTO obj : itemRequisitionDTO.getAdditionalItems()) {
					ItemReqDHib dHib = new ItemReqDHib();
					dHib.setHeaderFk(hib.getId());

					if (obj.getInsertionType() == 1) { // additional is inc or dec // req_type is additional item
						dHib.setAdditional(1);
						dHib.setReqType(0);
					} else {
						dHib.setAdditional(1);
						dHib.setReqType(1);
					}

					if (obj.getItemCategoryFk() != null) {
						dHib.setCategoryFk((int) obj.getItemCategoryFk().longValue());
					} else {
						dHib.setCategoryFk(0); // or handle as per your business rule
					}

					dHib.setCategory(obj.getItemCategoryName());
					dHib.setItemCode(obj.getItemCode());
					dHib.setItemName(obj.getItemName());
					dHib.setPackageId(obj.getPackageId());
					dHib.setPackagePrice(obj.getPackagePrice());

					dHib.setPackageBaseUnit(obj.getPackageBaseUnit());
					dHib.setPackageSecondaryUnit(obj.getPackageSecondaryUnit());

					dHib.setPackageBaseFactor(obj.getPackageBaseFactor());
					dHib.setPackageSecondaryFactor(obj.getPackageSecondaryFactor());

					dHib.setPackageSecondaryCost(obj.getPackageSecondaryCost());

					dHib.setChefUnit(obj.getChefUnit());
					dHib.setCostPrice(obj.getCostPrice());

					dHib.setSecondaryQuantity(obj.getQuantity());

					dHib.setQuantity(obj.getQuantity());
					dHib.setBaseQuantity(obj.getQuantity() / obj.getPackageSecondaryFactor());

					dHib.setCost(obj.getPackageSecondaryCost() * obj.getQuantity());

					itemReqDRepository.save(dHib);
				}
			}

			response.setMessage(AppConstants.MSG_RECORD_CREATED);
			response.setSuccess(AppConstants.TRUE);

		} catch (DataAccessException dae) {
			log.error(AppConstants.DATA_EXCEPTION_SAVE + " Item Requisition ", dae);
			response.setSuccess(AppConstants.FALSE);
			response.setMessage(AppConstants.DATA_EXCEPTION_SAVE);
		} catch (RestException re) {
			log.warn(AppConstants.REST_EXCEPTION_SAVE + " Item Requisition", re);
			response.setSuccess(AppConstants.FALSE);
			response.setMessage(re.getMessage());
		} catch (Exception e) {
			log.error(AppConstants.EXCEPTION_SAVING + " Item Requisition", e);
			response.setSuccess(AppConstants.FALSE);
			response.setMessage(AppConstants.EXCEPTION_SAVING);
		}

		return response;
	}

	private static String generateIDReq() {
		Date date = new Date(); // current date
		String year = new SimpleDateFormat("yy").format(date);
		String month = new SimpleDateFormat("MM").format(date);
		String day = new SimpleDateFormat("dd").format(date);

		return "REQ" + year + month + day;
	}

	private static String generateIDReq(Integer number) {
		Date date = new Date(); // current date
		String year = new SimpleDateFormat("yy").format(date);
		String month = new SimpleDateFormat("MM").format(date);
		String day = new SimpleDateFormat("dd").format(date);
		NumberFormat decimalFormat = new DecimalFormat("0000");
		String x = decimalFormat.format(number);

		return "REQ" + year + month + day + x;
	}

	public ResponseDTO<ItemRequisitionDTO> itemReqsList(ItemRequisitionDTO itemRequisitionDTO) {
		ResponseDTO<ItemRequisitionDTO> response = new ResponseDTO<>();
		try {
			int locationFk = itemRequisitionDTO.getLocationFk();
			ItemRequisitionDTO sDto = new ItemRequisitionDTO();
			List<ItemReqHHib> itemReqList = itemReqHRepository.findBym(locationFk);

			List<ItemRequisitionDTO> itemList = new ArrayList<>();
			if (itemReqList != null && !itemReqList.isEmpty()) {
				for (ItemReqHHib hib : itemReqList) {

					ItemRequisitionDTO dto = new ItemRequisitionDTO();

					dto.setId(hib.getId());
					dto.setReqNo(hib.getReqId());
					dto.setDates(hib.getFromDate());
					SimpleDateFormat sdf = new SimpleDateFormat("dd-MMM-yyyy");
					String fromDateStr = hib.getFromDate() != null ? sdf.format(hib.getFromDate()) : "";
					String toDateStr = hib.getToDate() != null ? sdf.format(hib.getToDate()) : "";

					dto.setPeriod(fromDateStr + " - " + toDateStr);

					int itemCount = itemReqDRepository.uniqueItemCountByMenuM(hib.getId());
					dto.setItemCount(itemCount);
					dto.setCreatedDate(sdf.format(hib.getCreatedDate()));

					itemList.add(dto);
				}
				sDto.setItemList(itemList);

				response.setData(sDto);
				response.setSuccess(AppConstants.TRUE);
				response.setMessage(AppConstants.MSG_RECORD_FETCHED);

			} else {
				response.setSuccess(AppConstants.FALSE);
				response.setMessage(AppConstants.IS_EMPTY);
			}

		} catch (Exception e) {
			response.setSuccess(AppConstants.FALSE);
			response.setMessage("Exception in itemReqsList");
			log.error("Error in itemReqsList", e);
		}
		return response;
	}

	public ResponseDTO<ItemRequisitionDTO> viewItemRequ(int id) {
		ResponseDTO<ItemRequisitionDTO> response = new ResponseDTO<>();

		try {
			ItemReqHHib itemReqList = itemReqHRepository.findById(id);
			if (itemReqList != null) {
				double totalPob = 0;

				ItemRequisitionDTO dto = new ItemRequisitionDTO();
				dto.setId(itemReqList.getId());
				dto.setRemarks(itemReqList.getRemarks());
				dto.setFromDates(itemReqList.getFromDate());
				dto.setToDates(itemReqList.getToDate());
				dto.setMenuFkList(Arrays.stream(itemReqList.getMenuFk().split(",")).map(Integer::parseInt).toList());

				MstLocationMenuHib loc = mstLoctionMenuRepository.findById(itemReqList.getLocationFk());
				if (loc != null) {
					dto.setLocationCode(loc.getLocationId());
					dto.setLocationName(loc.getLocationName());
				}

				// ---------- MENUS ----------
//				List<ItemRequisitionDTO> menuList = new ArrayList<>();
//				for (Integer mlist : dto.getMenuFkList()) {
//
//					Optional<IssueMenuMHib> mHib1 = issueMenuMRepository.findById(mlist);
//
//					IssueMenuMHib mHib = mHib1.get();
//					double pob = 0;
//					if (mHib != null) {
//						totalPob += mHib.getActualPob();
//						pob = mHib.getActualPob();
//					}
//
//					List<IssueMenuHHib> menus = issueMenuHRepository.findByMenuMFk(mlist);
//					if (menus != null && !menus.isEmpty()) {
//						for (IssueMenuHHib hHib : menus) {
//							ItemRequisitionDTO menuDto = new ItemRequisitionDTO();
//							menuDto.setId(hHib.getId());
//							menuDto.setMealTypeFk(hHib.getMealTypeFk());
//							menuDto.setMealType(hHib.getMealTypeName());
//							menuDto.setMenuFk(hHib.getMenuFk());
//							menuDto.setMenuName(hHib.getMenuName());
//							menuDto.setFinalMenuName(mHib.getName());
//							menuDto.setDate(hHib.getMenuDate());
//							menuDto.setPob(pob);
//							int itemCount = issueMenuIRepository.uniqueItemCountByMenuM(hHib.getId());
//							menuDto.setItemCount(itemCount);
//
//							menuList.add(menuDto);
//						}
//					}
//				}
//				dto.setMenuList(menuList);

				// ---------- MENUS WITH CORRECT ITEM COUNT ----------
				List<ItemRequisitionDTO> menuList = new ArrayList<>();

				for (Integer menuId : dto.getMenuFkList()) {

					Optional<IssueMenuMHib> menuMOpt = issueMenuMRepository.findById(menuId);
					if (menuMOpt.isEmpty())
						continue;

					IssueMenuMHib menuM = menuMOpt.get();
					double pob = menuM.getActualPob();
					totalPob += pob;

					List<IssueMenuHHib> mealHeaders = issueMenuHRepository.findByMenuMFk(menuId);

					for (IssueMenuHHib mealHeader : mealHeaders) {

						ItemRequisitionDTO menuDto = new ItemRequisitionDTO();
						menuDto.setId(mealHeader.getId());
						menuDto.setMenuFk(mealHeader.getMenuFk());
						menuDto.setFinalMenuName(menuM.getName());
						menuDto.setMenuName(mealHeader.getMenuName());
						menuDto.setMealTypeFk(mealHeader.getMealTypeFk());
						menuDto.setMealType(mealHeader.getMealTypeName());
						menuDto.setDate(mealHeader.getMenuDate());
						menuDto.setPob(pob);

						// ⭐⭐⭐ SAME LOGIC AS FIRST METHOD ⭐⭐⭐
						Set<String> uniqueItemCodes = new HashSet<>();

						List<IssueMenuIHib> menuItems = issueMenuIRepository.findItemsByMenuH(mealHeader.getId());

						if (menuItems != null) {
							for (IssueMenuIHib item : menuItems) {

								double factor = pob * item.getPobParticipation() / 100.0;
								double finalQty = item.getSecondaryQuantity() * factor;

								// same filter as v1: ignore zero qty
								if (Math.abs(finalQty) < 0.0001)
									continue;

								uniqueItemCodes.add(item.getItemCode());
							}
						}

						// ⭐ FINAL item count result (same as v1)
						menuDto.setItemCount(uniqueItemCodes.size());

						menuList.add(menuDto);
					}
				}

				dto.setMenuList(menuList);

				// ---------- ITEMS ----------
				List<ItemRequisitionDTO> itemList = new ArrayList<>();
				List<ItemRequisitionDTO> additionalList = new ArrayList<>();
				Map<String, ItemRequisitionDTO> summaryItemMap = new HashMap<>();

				List<ItemReqDHib> menus = itemReqDRepository.findByMenuMFk(id);
				if (menus != null) {
					for (ItemReqDHib menu : menus) {

						ItemRequisitionDTO menuDto = new ItemRequisitionDTO();
						menuDto.setItemCategoryName(menu.getCategory());
						menuDto.setItemName(menu.getItemName());
						menuDto.setItemCode(menu.getItemCode());
						menuDto.setPackageId(menu.getPackageId());
						menuDto.setPackagePrice(menu.getPackagePrice());
						menuDto.setPackageBaseUnit(menu.getPackageBaseUnit());
						menuDto.setPackageSecondaryUnit(menu.getPackageSecondaryUnit());
						menuDto.setPackageBaseFactor(menu.getPackageBaseFactor());
						menuDto.setPackageSecondaryFactor(menu.getPackageSecondaryFactor());
						menuDto.setPackageSecondaryCost(menu.getPackageSecondaryCost());
						menuDto.setSecondaryQuantity(menu.getSecondaryQuantity());
						menuDto.setQuantity(menu.getQuantity());
						menuDto.setChefUnit(menu.getChefUnit());
						menuDto.setCostPrice(menu.getCostPrice());
						menuDto.setBaseQuantity(menu.getBaseQuantity());
						menuDto.setBaseTotal(menu.getCost());
						menuDto.setDates(menu.getDate());
						menuDto.setAdditional(menu.getAdditional());
						menuDto.setRequestType(menu.getReqType());

						if (menu.getAdditional() == 0 && menu.getReqType() == 0) {
							itemList.add(menuDto);
						} else {
							additionalList.add(menuDto);
						}

						// ---------- SUMMARY GROUPING (by itemCode) ----------
						if (menu.getAdditional() == 0 && menu.getReqType() == 0) {
							summaryItemMap.compute(menu.getItemCode(), (k, existing) -> {
								if (existing == null) {
									ItemRequisitionDTO dtoItem = new ItemRequisitionDTO();
									dtoItem.setItemCategoryName(menu.getCategory());
									dtoItem.setItemName(menu.getItemName());
									dtoItem.setItemCode(menu.getItemCode());
									dtoItem.setPackageId(menu.getPackageId());
									dtoItem.setPackagePrice(menu.getPackagePrice());
									dtoItem.setPackageBaseUnit(menu.getPackageBaseUnit());
									dtoItem.setPackageSecondaryUnit(menu.getPackageSecondaryUnit());
									dtoItem.setPackageBaseFactor(menu.getPackageBaseFactor());
									dtoItem.setPackageSecondaryFactor(menu.getPackageSecondaryFactor());
									dtoItem.setPackageSecondaryCost(menu.getPackageSecondaryCost());
									dtoItem.setSecondaryQuantity(menu.getSecondaryQuantity());
									dtoItem.setQuantity(menu.getQuantity());
									dtoItem.setChefUnit(menu.getChefUnit());
									dtoItem.setCostPrice(menu.getCostPrice());
									dtoItem.setBaseQuantity(menu.getBaseQuantity());
									dtoItem.setBaseTotal(menu.getCost());
									dtoItem.setDates(menu.getDate());
									dtoItem.setAdditional(menu.getAdditional());
									dtoItem.setRequestType(menu.getReqType());
									return dtoItem;
								} else {
									existing.setBaseQuantity(existing.getBaseQuantity() + menu.getBaseQuantity());
									existing.setBaseTotal(existing.getBaseTotal() + menu.getCost());
									return existing;
								}
							});
						}
					}
				}

				// Convert summary map into list
				List<ItemRequisitionDTO> summaryItemList = new ArrayList<>(summaryItemMap.values());

				// ---------- Attach to DTO ----------
				dto.setItemList(itemList); // normal items
				dto.setAdditionalItems(additionalList); // additional items
				dto.setSummaryItemList(summaryItemList); // summary grouped by itemCode
				dto.setTotalPob(totalPob);

				response.setData(dto);
				response.setSuccess(AppConstants.TRUE);
				response.setMessage(AppConstants.MSG_RECORD_FETCHED);
			} else {
				response.setSuccess(AppConstants.FALSE);
				response.setMessage(AppConstants.MSG_NO_RECORDS_FOUND);
			}

		} catch (Exception e) {
			log.error("Error while fetching Final Set Menu by ID", e);
			response.setSuccess(AppConstants.FALSE);
			response.setMessage(AppConstants.EXCEPTION);
		}

		return response;
	}

	public ResponseDTO<ItemRequisitionDTO> prepareItemRequisitionData(int headerId) {
		ResponseDTO<ItemRequisitionDTO> response = new ResponseDTO<>();

		try {
			ItemReqHHib header = itemReqHRepository.findById(headerId);
			if (header == null) {
				response.setSuccess(AppConstants.FALSE);
				response.setMessage("Requisition not found");
				return response;
			}

			List<ItemReqDHib> details = itemReqDRepository.findByMenuMFk(headerId);

			// 1) Date-wise for base items
			Map<String, Map<String, ItemRequisitionDTO>> dateWiseItemMap = new TreeMap<>();

			// 2) Non-date item list (REQ=0 & ADD=1)
			List<ItemRequisitionDTO> itemList = new ArrayList<>();

			// 3) Additional items list (REQ=1 & ADD=1)
			List<ItemRequisitionDTO> additionalItems = new ArrayList<>();

			if (details != null) {
				for (ItemReqDHib d : details) {
					Date detailDate = d.getDate();
					String dateKey = (detailDate != null) ? new SimpleDateFormat("yyyy-MM-dd").format(detailDate) : "";

					// ---------- Case 1: REQ=0 && ADD=0 (date wise) ----------
					if (d.getReqType() == 0 && d.getAdditional() == 0) {
						dateWiseItemMap.computeIfAbsent(dateKey, k -> new LinkedHashMap<>()).compute(d.getItemCode(),
								(k, existing) -> {
									if (existing == null) {
										ItemRequisitionDTO dto = new ItemRequisitionDTO();
										dto.setItemCode(d.getItemCode());
										dto.setItemName(d.getItemName());
										dto.setItemCategoryName(d.getCategory());
										dto.setPackageId(d.getPackageId());
										dto.setPackagePrice(d.getPackagePrice());
										dto.setChefUnit(d.getChefUnit());
										dto.setCostPrice(d.getCostPrice());
										dto.setBaseQuantity(d.getQuantity());
										dto.setBaseTotal(d.getCost());
										dto.setAdjustedQuantity(0.0);
										dto.setDate(dateKey);
										return dto;
									} else {
										existing.setBaseQuantity(existing.getBaseQuantity() + d.getQuantity());
										existing.setBaseTotal(existing.getBaseTotal() + d.getCost());
										return existing;
									}
								});
					}

					// ---------- Case 2: REQ=0 && ADD=1 (normal item list, adjusted qty) ----------
					else if (d.getReqType() == 0 && d.getAdditional() == 1) {
						ItemRequisitionDTO dto = new ItemRequisitionDTO();
						dto.setItemCode(d.getItemCode());
						dto.setItemName(d.getItemName());
						dto.setItemCategoryName(d.getCategory());
						dto.setPackageId(d.getPackageId());
						dto.setPackagePrice(d.getPackagePrice());
						dto.setChefUnit(d.getChefUnit());
						dto.setCostPrice(d.getCostPrice());
						dto.setBaseQuantity(0.0);
						dto.setBaseTotal(0.0);
						dto.setAdjustedQuantity(d.getQuantity());
						itemList.add(dto);
					}

					// ---------- Case 3: REQ=1 && ADD=1 (separate additional list) ----------
					else if (d.getReqType() == 1 && d.getAdditional() == 1) {
						ItemRequisitionDTO dto = new ItemRequisitionDTO();
						dto.setItemCode(d.getItemCode());
						dto.setItemName(d.getItemName());
						dto.setItemCategoryName(d.getCategory());
						dto.setPackageId(d.getPackageId());
						dto.setPackagePrice(d.getPackagePrice());
						dto.setChefUnit(d.getChefUnit());
						dto.setCostPrice(d.getCostPrice());
						dto.setBaseQuantity(0.0);
						dto.setBaseTotal(0.0);
						dto.setAdjustedQuantity(d.getQuantity());
						additionalItems.add(dto);
					}
				}
			}

			// Convert date-wise maps into ordered lists
			Map<String, List<ItemRequisitionDTO>> dateWiseItems = new LinkedHashMap<>();
			for (Map.Entry<String, Map<String, ItemRequisitionDTO>> entry : dateWiseItemMap.entrySet()) {
				dateWiseItems.put(entry.getKey(), new ArrayList<>(entry.getValue().values()));
			}

			// Prepare final DTO
			ItemRequisitionDTO dto = new ItemRequisitionDTO();
			dto.setId(header.getId());
			dto.setReqNo(header.getReqId());
			dto.setFromDates(header.getFromDate());
			dto.setToDates(header.getToDate());
			dto.setRemarks(header.getRemarks());
			dto.setDateWiseItemList(dateWiseItems); // case 1
			dto.setItemList(itemList); // case 2
			dto.setAdditionalItems(additionalItems); // case 3

			MstLocationMenuHib loc = mstLoctionMenuRepository.findById(header.getLocationFk());
			if (loc != null) {
				dto.setLocationCode(loc.getLocationId());
				dto.setLocationName(loc.getLocationName());
			}

			response.setData(dto);
			response.setSuccess(AppConstants.TRUE);
			response.setMessage(AppConstants.MSG_RECORD_FETCHED);

		} catch (Exception e) {
			log.error("Error while preparing requisition data", e);
			response.setSuccess(AppConstants.FALSE);
			response.setMessage(AppConstants.EXCEPTION);
		}

		return response;
	}

	public ResponseEntity<byte[]> printexcelreportForMaterialOld(int id) {
		try {
			// === 1. Fetch Data (delegate to client) ===
			ResponseDTO<ItemRequisitionDTO> response = prepareItemRequisitionData(id);
			ItemRequisitionDTO itemRequisitionDTOEdit = response != null ? response.getData() : null;

			if (itemRequisitionDTOEdit == null) {
				String msg = "No data found for requisition ID: " + id;
				return ResponseEntity.badRequest().contentType(MediaType.TEXT_PLAIN).body(msg.getBytes());
			}

			// === 2. Workbook Setup ===
			SimpleDateFormat sdf = new SimpleDateFormat("dd-MM-yyyy");
			HSSFWorkbook workbook = new HSSFWorkbook();

			// === 3. Define All Styles (converted to modern POI API) ===
			// headerStyle1
			CellStyle headerStyle1 = workbook.createCellStyle();
			headerStyle1.setBorderBottom(BorderStyle.THIN);
			headerStyle1.setBorderTop(BorderStyle.THIN);
			headerStyle1.setBorderLeft(BorderStyle.THIN);
			headerStyle1.setBorderRight(BorderStyle.THIN);
			headerStyle1.setLocked(true);
			Font f = workbook.createFont();
			f.setBold(true);
			f.setColor(IndexedColors.BLUE.getIndex());
			headerStyle1.setFont(f);

			// subtitle
			CellStyle subtitle = workbook.createCellStyle();
			subtitle.setBorderBottom(BorderStyle.THIN);
			subtitle.setBorderTop(BorderStyle.THIN);
			subtitle.setBorderLeft(BorderStyle.THIN);
			subtitle.setBorderRight(BorderStyle.THIN);
			subtitle.setLocked(true);

			// generatdtedby
			CellStyle generatdtedby = workbook.createCellStyle();
			generatdtedby.setAlignment(HorizontalAlignment.CENTER); // was (short)3, center
			generatdtedby.setBorderBottom(BorderStyle.THIN);
			generatdtedby.setBorderTop(BorderStyle.THIN);
			generatdtedby.setBorderLeft(BorderStyle.THIN);
			generatdtedby.setBorderRight(BorderStyle.THIN);
			generatdtedby.setLocked(true);
			Font ser = workbook.createFont();
			ser.setBold(true);
			ser.setColor(IndexedColors.BLACK.getIndex());
			generatdtedby.setFont(ser);

			// headerStyle
			CellStyle headerStyle = workbook.createCellStyle();
			headerStyle.setBorderBottom(BorderStyle.THIN);
			headerStyle.setBorderTop(BorderStyle.THIN);
			headerStyle.setBorderLeft(BorderStyle.THIN);
			headerStyle.setBorderRight(BorderStyle.THIN);
			headerStyle.setLocked(true);

			// right
			CellStyle right = workbook.createCellStyle();
			right.setAlignment(HorizontalAlignment.RIGHT);
			right.setWrapText(true);
			right.setBorderBottom(BorderStyle.THIN);
			right.setBorderTop(BorderStyle.THIN);
			right.setBorderLeft(BorderStyle.THIN);
			right.setBorderRight(BorderStyle.THIN);
			right.setLocked(true);

			// middle
			CellStyle middle = workbook.createCellStyle();
			middle.setAlignment(HorizontalAlignment.CENTER);
			middle.setBorderBottom(BorderStyle.THIN);
			middle.setBorderTop(BorderStyle.THIN);
			middle.setBorderLeft(BorderStyle.THIN);
			middle.setBorderRight(BorderStyle.THIN);
			Font font = workbook.createFont();
			font.setColor(IndexedColors.BLACK.getIndex());
			middle.setFont(font);
			middle.setLocked(true);

			// totl
			CellStyle totl = workbook.createCellStyle();
			totl.setAlignment(HorizontalAlignment.CENTER);
			totl.setBorderBottom(BorderStyle.THIN);
			totl.setBorderTop(BorderStyle.THIN);
			totl.setBorderLeft(BorderStyle.THIN);
			totl.setBorderRight(BorderStyle.THIN);
			totl.setWrapText(true);
			totl.setLocked(true);
			f.setBold(true);
			totl.setFont(f);

			// name
			CellStyle name = workbook.createCellStyle();
			name.setAlignment(HorizontalAlignment.LEFT);
			name.setBorderBottom(BorderStyle.THIN);
			name.setBorderTop(BorderStyle.THIN);
			name.setBorderLeft(BorderStyle.THIN);
			name.setBorderRight(BorderStyle.THIN);
			Font fnt = workbook.createFont();
			fnt.setBold(true);
			fnt.setColor(IndexedColors.BLACK.getIndex());
			name.setFont(fnt);

			// str
			CellStyle str = workbook.createCellStyle();
			str.setAlignment(HorizontalAlignment.LEFT);
			str.setBorderBottom(BorderStyle.THIN);
			str.setBorderTop(BorderStyle.THIN);
			str.setBorderLeft(BorderStyle.THIN);
			str.setBorderRight(BorderStyle.THIN);
			Font font1 = workbook.createFont();
			font1.setColor(IndexedColors.BLACK.getIndex());
			str.setFont(font1);
			str.setLocked(true);

			// Date
			CellStyle dateStyle = workbook.createCellStyle();
			dateStyle.setAlignment(HorizontalAlignment.CENTER);
			dateStyle.setBorderBottom(BorderStyle.THIN);
			dateStyle.setBorderTop(BorderStyle.THIN);
			dateStyle.setBorderLeft(BorderStyle.THIN);
			dateStyle.setBorderRight(BorderStyle.THIN);
			Font ff = workbook.createFont();
			ff.setColor(IndexedColors.BLACK.getIndex());
			dateStyle.setFont(ff);
			dateStyle.setLocked(true);

			// titleStyle
			CellStyle titleStyle = workbook.createCellStyle();
			titleStyle.setLocked(true);
			ser = workbook.createFont();
			ser.setBold(true);
			ser.setColor(IndexedColors.BLACK.getIndex());
			titleStyle.setFont(ser);

			// === 4. Create Sheet and Header ===
			HSSFSheet sheet = workbook.createSheet("REQ" + itemRequisitionDTOEdit.getReqNo());

			Row row = sheet.createRow(0);
			Cell cell = row.createCell(6);
			cell.setCellValue("Recipe Management");
			cell.setCellStyle(generatdtedby);

			row = sheet.createRow(1);
			cell = row.createCell(6);
			cell.setCellValue("Raw Material Requirement - Menu Based");
			cell.setCellStyle(generatdtedby);

			cell = row.createCell(5);
			cell.setCellValue("Generated Date:");
			cell.setCellStyle(generatdtedby);
			cell = row.createCell(6);
			cell.setCellValue(sdf.format(new Date()));
			cell.setCellStyle(name);

			// From Date / To Date
			row = sheet.createRow(3);
			cell = row.createCell(8);
			cell.setCellValue("From Date:");
			cell.setCellStyle(generatdtedby);
			cell = row.createCell(9);
			cell.setCellValue(sdf.format(itemRequisitionDTOEdit.getFromDates()));
			cell.setCellStyle(name);

			cell = row.createCell(10);
			cell.setCellValue("To Date:");
			cell.setCellStyle(generatdtedby);
			cell = row.createCell(11);
			cell.setCellValue(sdf.format(itemRequisitionDTOEdit.getToDates()));
			cell.setCellStyle(name);

			// === 5. Column Headers ===
			int rowCount = 5;
			row = sheet.createRow(rowCount);

			cell = row.createCell(0);
			cell.setCellValue("Category Id");
			cell.setCellStyle(totl);
			sheet.setColumnWidth(0, 6000);

			cell = row.createCell(1);
			cell.setCellValue("Item Code");
			cell.setCellStyle(totl);
			sheet.setColumnWidth(1, 4000);

			cell = row.createCell(2);
			cell.setCellValue("Item Name");
			cell.setCellStyle(totl);
			sheet.setColumnWidth(2, 9000);

			cell = row.createCell(3);
			cell.setCellValue("Package ID");
			cell.setCellStyle(totl);
			sheet.setColumnWidth(3, 4000);

			cell = row.createCell(4);
			cell.setCellValue("Package Price");
			cell.setCellStyle(totl);
			sheet.setColumnWidth(4, 4000);

			cell = row.createCell(5);
			cell.setCellValue("Chef Unit");
			cell.setCellStyle(totl);
			sheet.setColumnWidth(5, 4000);

			cell = row.createCell(6);
			cell.setCellValue("Cost Price");
			cell.setCellStyle(totl);
			sheet.setColumnWidth(6, 4000);

			// Add date columns for each day in the range
			int dateColIndex = 7;
			Map<String, Integer> dateColumnMap = new HashMap<>();

			// Get all unique dates from dateWiseItemList
			Set<String> allDates = new TreeSet<>();
			if (itemRequisitionDTOEdit.getDateWiseItemList() != null) {
				allDates.addAll(itemRequisitionDTOEdit.getDateWiseItemList().keySet());
			}

			// Add date columns
			for (String dateStr : allDates) {
				cell = row.createCell(dateColIndex);
				cell.setCellValue(dateStr);
				cell.setCellStyle(totl);
				sheet.setColumnWidth(dateColIndex, 4000);
				dateColumnMap.put(dateStr, dateColIndex);
				dateColIndex++;
			}

			cell = row.createCell(dateColIndex);
			cell.setCellValue("Quantity");
			cell.setCellStyle(totl);
			sheet.setColumnWidth(dateColIndex, 4000);
			int quantityColIndex = dateColIndex++;

			cell = row.createCell(dateColIndex);
			cell.setCellValue("Add / Remove");
			cell.setCellStyle(totl);
			sheet.setColumnWidth(dateColIndex, 4000);
			int addRemoveColIndex = dateColIndex++;

			cell = row.createCell(dateColIndex);
			cell.setCellValue("Final Qty");
			cell.setCellStyle(totl);
			sheet.setColumnWidth(dateColIndex, 4000);
			int finalQtyColIndex = dateColIndex++;

			cell = row.createCell(dateColIndex);
			cell.setCellValue("Cost");
			cell.setCellStyle(totl);
			sheet.setColumnWidth(dateColIndex, 4000);
			int costColIndex = dateColIndex++;

			cell = row.createCell(dateColIndex);
			cell.setCellValue("Request Type");
			cell.setCellStyle(totl);
			sheet.setColumnWidth(dateColIndex, 4000);

			double grnTotal = 0;
			rowCount++;

			// === 6. Consolidate Items ===
			Map<String, ItemRequisitionDTO> consolidatedItems = new LinkedHashMap<>();

			// Process date-wise items
			if (itemRequisitionDTOEdit.getDateWiseItemList() != null) {
				for (Map.Entry<String, List<ItemRequisitionDTO>> dateEntry : itemRequisitionDTOEdit
						.getDateWiseItemList().entrySet()) {
					String date = dateEntry.getKey();
					for (ItemRequisitionDTO item : dateEntry.getValue()) {
						String itemCode = item.getItemCode();

						if (!consolidatedItems.containsKey(itemCode)) {
							ItemRequisitionDTO consolidatedItem = new ItemRequisitionDTO();
							consolidatedItem.setItemCode(itemCode);
							consolidatedItem.setItemName(item.getItemName());
							consolidatedItem.setItemCategoryName(item.getItemCategoryName());
							consolidatedItem.setPackageId(item.getPackageId());
							consolidatedItem.setPackagePrice(item.getPackagePrice());
							consolidatedItem.setChefUnit(item.getChefUnit());
							consolidatedItem.setCostPrice(item.getCostPrice());
							consolidatedItem.setBaseQuantity(0.0);
							consolidatedItem.setBaseTotal(0.0);
							consolidatedItem.setDateQuantities(new HashMap<>());
							consolidatedItems.put(itemCode, consolidatedItem);
						}

						ItemRequisitionDTO consolidatedItem = consolidatedItems.get(itemCode);
						consolidatedItem.getDateQuantities().put(date, item.getBaseQuantity());
						consolidatedItem.setBaseQuantity(consolidatedItem.getBaseQuantity() + item.getBaseQuantity());
						consolidatedItem.setBaseTotal(consolidatedItem.getBaseTotal() + item.getBaseTotal());
					}
				}
			}

			// Process regular items (non-date specific)
			if (itemRequisitionDTOEdit.getItemList() != null) {
				for (ItemRequisitionDTO item : itemRequisitionDTOEdit.getItemList()) {
					String itemCode = item.getItemCode();

					if (!consolidatedItems.containsKey(itemCode)) {
						ItemRequisitionDTO consolidatedItem = new ItemRequisitionDTO();
						consolidatedItem.setItemCode(itemCode);
						consolidatedItem.setItemName(item.getItemName());
						consolidatedItem.setItemCategoryName(item.getItemCategoryName());
						consolidatedItem.setPackageId(item.getPackageId());
						consolidatedItem.setPackagePrice(item.getPackagePrice());
						consolidatedItem.setChefUnit(item.getChefUnit());
						consolidatedItem.setCostPrice(item.getCostPrice());
						consolidatedItem.setBaseQuantity(0.0);
						consolidatedItem.setBaseTotal(0.0);
						consolidatedItem.setAdjustedQuantity(item.getAdjustedQuantity());
						consolidatedItem.setDateQuantities(new HashMap<>());
						consolidatedItems.put(itemCode, consolidatedItem);
					}

					ItemRequisitionDTO consolidatedItem = consolidatedItems.get(itemCode);
					consolidatedItem.setAdjustedQuantity(item.getAdjustedQuantity());
				}
			}

			// Process additional items
			if (itemRequisitionDTOEdit.getAdditionalItems() != null) {
				for (ItemRequisitionDTO item : itemRequisitionDTOEdit.getAdditionalItems()) {
					String itemCode = item.getItemCode();

					if (!consolidatedItems.containsKey(itemCode)) {
						ItemRequisitionDTO consolidatedItem = new ItemRequisitionDTO();
						consolidatedItem.setItemCode(itemCode);
						consolidatedItem.setItemName(item.getItemName());
						consolidatedItem.setItemCategoryName(item.getItemCategoryName());
						consolidatedItem.setPackageId(item.getPackageId());
						consolidatedItem.setPackagePrice(item.getPackagePrice());
						consolidatedItem.setChefUnit(item.getChefUnit());
						consolidatedItem.setCostPrice(item.getCostPrice());
						consolidatedItem.setBaseQuantity(0.0);
						consolidatedItem.setBaseTotal(0.0);
						consolidatedItem.setAdjustedQuantity(item.getAdjustedQuantity());
						consolidatedItem.setDateQuantities(new HashMap<>());
						consolidatedItems.put(itemCode, consolidatedItem);
					}

					ItemRequisitionDTO consolidatedItem = consolidatedItems.get(itemCode);
					consolidatedItem.setAdjustedQuantity(item.getAdjustedQuantity());
				}
			}

			// === 7. Write Rows ===
			DecimalFormat df = new DecimalFormat("##,##,##0.000");
			for (ItemRequisitionDTO item : consolidatedItems.values()) {
				row = sheet.createRow(rowCount++);

				cell = row.createCell(0);
				cell.setCellValue(defaultString(item.getItemCategoryName()));
				cell.setCellStyle(str);

				cell = row.createCell(1);
				cell.setCellValue(defaultString(item.getItemCode()));
				cell.setCellStyle(str);

				cell = row.createCell(2);
				cell.setCellValue(defaultString(item.getItemName()));
				cell.setCellStyle(str);

				cell = row.createCell(3);
				cell.setCellValue(defaultString(item.getPackageId()));
				cell.setCellStyle(dateStyle);

				cell = row.createCell(4);
				String desiValue = df.format(item.getPackagePrice());
				cell.setCellValue(desiValue);
				cell.setCellStyle(right);

				cell = row.createCell(5);
				cell.setCellValue(defaultString(item.getChefUnit()));
				cell.setCellStyle(dateStyle);

				cell = row.createCell(6);
				desiValue = df.format(item.getCostPrice());
				cell.setCellValue(desiValue);
				cell.setCellStyle(right);

				// date wise columns
				for (Map.Entry<String, Integer> dateEntry : dateColumnMap.entrySet()) {
					String date = dateEntry.getKey();
					int colIndex = dateEntry.getValue();

					Double quantity = item.getDateQuantities() != null
							? item.getDateQuantities().getOrDefault(date, 0.0)
							: 0.0;
					cell = row.createCell(colIndex);
					desiValue = df.format(quantity != null ? quantity : 0.0);
					cell.setCellValue(desiValue);
					cell.setCellStyle(right);
				}

				// Quantity column (total of all dates)
				cell = row.createCell(quantityColIndex);
				desiValue = df.format(item.getBaseQuantity());
				cell.setCellValue(desiValue);
				cell.setCellStyle(right);

				// Add/Remove column
				cell = row.createCell(addRemoveColIndex);
				desiValue = df.format(item.getAdjustedQuantity() != 0 ? item.getAdjustedQuantity() : 0.0);
				cell.setCellValue(desiValue);
				cell.setCellStyle(right);

				// Final Qty column (quantity + adjusted quantity)
				double finalQty = item.getBaseQuantity()
						+ (item.getAdjustedQuantity() != 0 ? item.getAdjustedQuantity() : 0.0);
				cell = row.createCell(finalQtyColIndex);
				desiValue = df.format(finalQty);
				cell.setCellValue(desiValue);
				cell.setCellStyle(right);

				// Cost column
				double cost = finalQty * item.getCostPrice();
				cell = row.createCell(costColIndex);
				desiValue = df.format(cost);
				cell.setCellValue(desiValue);
				cell.setCellStyle(right);
				grnTotal += cost;

				// Request Type column
				cell = row.createCell(costColIndex + 1);
				if (item.getAdjustedQuantity() != 0 && item.getAdjustedQuantity() > 0) {
					cell.setCellValue("Additional Item");
				} else {
					cell.setCellValue("Menu Item");
				}
				cell.setCellStyle(right);
			}

			// === 8. Total Row ===
			row = sheet.createRow(rowCount);
			cell = row.createCell(costColIndex - 1);
			cell.setCellValue("Grand Total:");
			cell.setCellStyle(totl);

			cell = row.createCell(costColIndex);
			String desiValue = df.format(grnTotal);
			cell.setCellValue(desiValue);
			cell.setCellStyle(right);

			// === 9. Convert to Response ===
			ByteArrayOutputStream out = new ByteArrayOutputStream();
			workbook.write(out);
			workbook.close();
			byte[] excelBytes = out.toByteArray();

			HttpHeaders headers = new HttpHeaders();
			headers.setContentType(MediaType.parseMediaType("application/vnd.ms-excel"));
			headers.set(HttpHeaders.CONTENT_DISPOSITION,
					"attachment; filename=" + itemRequisitionDTOEdit.getReqNo() + " - ItemRequisitionReport.xls");
			headers.setCacheControl("must-revalidate, post-check=0, pre-check=0");

			return new ResponseEntity<>(excelBytes, headers, HttpStatus.OK);

		} catch (Exception e) {
			e.printStackTrace();
			String msg = "Error generating Excel: " + e.getMessage();
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).contentType(MediaType.TEXT_PLAIN)
					.body(msg.getBytes());
		}
	}

	// helper to guard null strings (keeps sheet from getting "null")
	private String defaultString(String s) {
		return s == null ? "" : s;
	}

	public ResponseEntity<byte[]> printCSVReportForMaterialOld(int id) {
		try {
			// === Fetch Requisition Data ===
			ResponseDTO<ItemRequisitionDTO> response = prepareItemRequisitionData(id);
			ItemRequisitionDTO itemRequisitionDTOEdit = response.getData();

			if (itemRequisitionDTOEdit == null) {
				return ResponseEntity.badRequest().body(("No data found for requisition ID: " + id).getBytes());
			}

			// === Prepare CSV ===
			StringBuilder sb = new StringBuilder();

			// Header row - matching the sample file structure
			sb.append("Category Id,");
			sb.append("Item Code,");
			sb.append("Item Name,");
			sb.append("Package ID,");
			sb.append("Package Price,");
			sb.append("Chef Unit,");
			sb.append("Cost Price,");

			// Get all unique dates from dateWiseItemList and sort them
			Set<String> allDates = new TreeSet<>();
			if (itemRequisitionDTOEdit.getDateWiseItemList() != null) {
				allDates.addAll(itemRequisitionDTOEdit.getDateWiseItemList().keySet());
			}

			// Add date columns in sorted order
			for (String dateStr : allDates) {
				sb.append(dateStr).append(",");
			}

			sb.append("Quantity,");
			sb.append("Add / Remove,");
			sb.append("Final Qty,");
			sb.append("Cost");
			sb.append('\n');

			// Create a map to consolidate all items by item code
			Map<String, ItemRequisitionDTO> consolidatedItems = new LinkedHashMap<>();

			// === Process date-wise items ===
			if (itemRequisitionDTOEdit.getDateWiseItemList() != null
					&& !itemRequisitionDTOEdit.getDateWiseItemList().isEmpty()) {
				for (Map.Entry<String, List<ItemRequisitionDTO>> dateEntry : itemRequisitionDTOEdit
						.getDateWiseItemList().entrySet()) {
					String date = dateEntry.getKey();
					for (ItemRequisitionDTO item : dateEntry.getValue()) {
						String itemCode = item.getItemCode();

						if (!consolidatedItems.containsKey(itemCode)) {
							ItemRequisitionDTO consolidatedItem = new ItemRequisitionDTO();
							consolidatedItem.setItemCode(itemCode);
							consolidatedItem.setItemName(item.getItemName());
							consolidatedItem.setItemCategoryName(item.getItemCategoryName());
							consolidatedItem.setPackageId(item.getPackageId());
							consolidatedItem.setPackagePrice(item.getPackagePrice());
							consolidatedItem.setChefUnit(item.getChefUnit());
							consolidatedItem.setCostPrice(item.getCostPrice());
							consolidatedItem.setBaseQuantity(0.0);
							consolidatedItem.setBaseTotal(0.0);
							consolidatedItem.setAdjustedQuantity(0.0);
							consolidatedItem.setDateQuantities(new HashMap<>());
							consolidatedItems.put(itemCode, consolidatedItem);
						}

						// Add the quantity for this date
						ItemRequisitionDTO consolidatedItem = consolidatedItems.get(itemCode);
						consolidatedItem.getDateQuantities().put(date, item.getBaseQuantity());
						consolidatedItem.setBaseQuantity(consolidatedItem.getBaseQuantity() + item.getBaseQuantity());
					}
				}
			}

			// === Process regular items (non-date specific) ===
			if (itemRequisitionDTOEdit.getItemList() != null && !itemRequisitionDTOEdit.getItemList().isEmpty()) {
				for (ItemRequisitionDTO item : itemRequisitionDTOEdit.getItemList()) {
					String itemCode = item.getItemCode();

					if (!consolidatedItems.containsKey(itemCode)) {
						ItemRequisitionDTO consolidatedItem = new ItemRequisitionDTO();
						consolidatedItem.setItemCode(itemCode);
						consolidatedItem.setItemName(item.getItemName());
						consolidatedItem.setItemCategoryName(item.getItemCategoryName());
						consolidatedItem.setPackageId(item.getPackageId());
						consolidatedItem.setPackagePrice(item.getPackagePrice());
						consolidatedItem.setChefUnit(item.getChefUnit());
						consolidatedItem.setCostPrice(item.getCostPrice());
						consolidatedItem.setBaseQuantity(item.getBaseQuantity());
						consolidatedItem.setBaseTotal(item.getBaseTotal());
						consolidatedItem.setAdjustedQuantity(item.getAdjustedQuantity());
						consolidatedItem.setDateQuantities(new HashMap<>());
						consolidatedItems.put(itemCode, consolidatedItem);
					} else {
						// If item already exists from date-wise processing, add to base quantity
						ItemRequisitionDTO consolidatedItem = consolidatedItems.get(itemCode);
						consolidatedItem.setBaseQuantity(consolidatedItem.getBaseQuantity() + item.getBaseQuantity());
						consolidatedItem.setAdjustedQuantity(
								consolidatedItem.getAdjustedQuantity() + item.getAdjustedQuantity());
					}
				}
			}

			// === Process additional items ===
			if (itemRequisitionDTOEdit.getAdditionalItems() != null
					&& !itemRequisitionDTOEdit.getAdditionalItems().isEmpty()) {
				for (ItemRequisitionDTO item : itemRequisitionDTOEdit.getAdditionalItems()) {
					String itemCode = item.getItemCode();

					if (!consolidatedItems.containsKey(itemCode)) {
						ItemRequisitionDTO consolidatedItem = new ItemRequisitionDTO();
						consolidatedItem.setItemCode(itemCode);
						consolidatedItem.setItemName(item.getItemName());
						consolidatedItem.setItemCategoryName(item.getItemCategoryName());
						consolidatedItem.setPackageId(item.getPackageId());
						consolidatedItem.setPackagePrice(item.getPackagePrice());
						consolidatedItem.setChefUnit(item.getChefUnit());
						consolidatedItem.setCostPrice(item.getCostPrice());
						consolidatedItem.setBaseQuantity(0.0);
						consolidatedItem.setBaseTotal(0.0);
						consolidatedItem.setAdjustedQuantity(item.getAdjustedQuantity());
						consolidatedItem.setDateQuantities(new HashMap<>());
						consolidatedItems.put(itemCode, consolidatedItem);
					} else {
						ItemRequisitionDTO consolidatedItem = consolidatedItems.get(itemCode);
						consolidatedItem.setAdjustedQuantity(
								consolidatedItem.getAdjustedQuantity() + item.getAdjustedQuantity());
					}
				}
			}
			double grandTotalCost = 0.0;
			// === Write all consolidated items to CSV ===
			for (ItemRequisitionDTO item : consolidatedItems.values()) {
				sb.append(item.getItemCategoryName() != null ? item.getItemCategoryName() : "").append(",");
				sb.append(item.getItemCode() != null ? item.getItemCode() : "").append(",");
				sb.append(item.getItemName() != null ? item.getItemName() : "").append(",");
				sb.append(item.getPackageId() != null ? item.getPackageId() : "").append(",");
				sb.append(formatDecimal(item.getPackagePrice())).append(",");
				sb.append(item.getChefUnit() != null ? item.getChefUnit() : "").append(",");
				sb.append(formatDecimal(item.getCostPrice())).append(",");

				// Date columns
				for (String date : allDates) {
					Double quantity = item.getDateQuantities() != null
							? item.getDateQuantities().getOrDefault(date, 0.0)
							: 0.0;
					sb.append(formatDecimal(quantity)).append(",");
				}

				double baseQty = item.getBaseQuantity() != 0 ? item.getBaseQuantity() : 0.0;
				sb.append(formatDecimal(baseQty)).append(",");

				double adjustment = item.getAdjustedQuantity();
				sb.append(formatDecimal(adjustment)).append(",");

				double finalQty = baseQty + adjustment;
				sb.append(formatDecimal(finalQty)).append(",");

				double costPrice = item.getCostPrice() != 0 ? item.getCostPrice() : 0.0;
				double cost = finalQty * costPrice;
				sb.append(formatDecimal(cost));

				grandTotalCost += cost;
				sb.append("\n");
			}

			// === Convert to ByteArray and Return as Download ===
			byte[] csvBytes = sb.toString().getBytes();
			String filename = itemRequisitionDTOEdit.getReqNo() + "-RawMaterialRequirement.csv";

			HttpHeaders headers = new HttpHeaders();
			headers.setContentType(MediaType.parseMediaType("text/csv"));
			headers.set(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"");

			return new ResponseEntity<>(csvBytes, headers, HttpStatus.OK);

		} catch (Exception e) {
			e.printStackTrace();
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
					.body(("Error generating CSV: " + e.getMessage()).getBytes());
		}
	}

	// === Helper method to format decimal numbers ===
	private String formatDecimal(double value) {
		DecimalFormat df = new DecimalFormat("0.000");
		df.setRoundingMode(RoundingMode.HALF_UP);
		return df.format(value);
	}

//  Estimation Table
	private boolean isSameDate(Date d1, Date d2) {
		return d1 != null && d2 != null && d1.toInstant().truncatedTo(java.time.temporal.ChronoUnit.DAYS)
				.equals(d2.toInstant().truncatedTo(java.time.temporal.ChronoUnit.DAYS));
	}

	private List<Integer> parseMenuFk(String menuFk) {
		if (menuFk == null || menuFk.trim().isEmpty())
			return Collections.emptyList();

		return Arrays.stream(menuFk.split(",")).map(String::trim).map(Integer::parseInt).toList();
	}

	public ResponseEntity<byte[]> downloadItemReqExcel(ItemRequisitionDTO itemRequisitionDTO) {

		try {
			int locationFk = itemRequisitionDTO.getLocationFk();

			List<ItemReqHHib> itemReqList = itemReqHRepository.findBym(locationFk);

			if (itemReqList == null || itemReqList.isEmpty()) {
				return ResponseEntity.badRequest().body("No records found".getBytes());
			}

			HSSFWorkbook workbook = new HSSFWorkbook();
			HSSFSheet sheet = workbook.createSheet("Item Requisition");

			SimpleDateFormat sdf = new SimpleDateFormat("dd-MMM-yyyy");

			/* ================= STYLES ================= */
			Font headerFont = workbook.createFont();
			headerFont.setBold(true);

			CellStyle headerStyle = workbook.createCellStyle();
			headerStyle.setFont(headerFont);
			headerStyle.setAlignment(HorizontalAlignment.CENTER);
			headerStyle.setBorderBottom(BorderStyle.THIN);
			headerStyle.setBorderTop(BorderStyle.THIN);
			headerStyle.setBorderLeft(BorderStyle.THIN);
			headerStyle.setBorderRight(BorderStyle.THIN);

			CellStyle dataStyle = workbook.createCellStyle();
			dataStyle.setBorderBottom(BorderStyle.THIN);
			dataStyle.setBorderTop(BorderStyle.THIN);
			dataStyle.setBorderLeft(BorderStyle.THIN);
			dataStyle.setBorderRight(BorderStyle.THIN);

			int rowCount = 0;
			Row row;
			Cell cell;

			/* ================= TITLE ================= */
			row = sheet.createRow(rowCount++);
			cell = row.createCell(0);
			cell.setCellValue("Item Requisition Report");
			cell.setCellStyle(headerStyle);
			sheet.addMergedRegion(new CellRangeAddress(0, 0, 0, 4));

			/* ================= GENERATED INFO ================= */
			row = sheet.createRow(rowCount++);
			row.createCell(0).setCellValue("Generated By:");
			row.createCell(1).setCellValue(getApproverName(itemRequisitionDTO.getCreatedBy()));
			row.createCell(3).setCellValue("Generated Date:");
			row.createCell(4).setCellValue(sdf.format(new Date()));

			rowCount++; // empty row

			/* ================= TABLE HEADER ================= */
			row = sheet.createRow(rowCount++);
			String[] headers = { "S.No", "Req No", "Period", "Item Count" };

			for (int i = 0; i < headers.length; i++) {
				cell = row.createCell(i);
				cell.setCellValue(headers[i]);
				cell.setCellStyle(headerStyle);
				sheet.setColumnWidth(i, 6000);
			}

			/* ================= DATA ================= */
			int sno = 1;

			for (ItemReqHHib hib : itemReqList) {

				row = sheet.createRow(rowCount++);

				String fromDate = hib.getFromDate() != null ? sdf.format(hib.getFromDate()) : "";
				String toDate = hib.getToDate() != null ? sdf.format(hib.getToDate()) : "";
				String period = fromDate + " - " + toDate;

				int itemCount = itemReqDRepository.uniqueItemCountByMenuM(hib.getId());

				row.createCell(0).setCellValue(sno++);
				row.createCell(1).setCellValue(hib.getReqId());
				row.createCell(2).setCellValue(period);
				row.createCell(3).setCellValue(itemCount);

				for (int i = 0; i < 4; i++) {
					row.getCell(i).setCellStyle(dataStyle);
				}
			}

			/* ================= WRITE ================= */
			ByteArrayOutputStream out = new ByteArrayOutputStream();
			workbook.write(out);
			workbook.close();

			HttpHeaders headersResp = new HttpHeaders();
			headersResp.setContentType(MediaType.parseMediaType("application/vnd.ms-excel"));
			headersResp.set(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=Item_Requisition_Report.xls");

			return new ResponseEntity<>(out.toByteArray(), headersResp, HttpStatus.OK);

		} catch (Exception e) {
			log.error("Excel generation error", e);
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
					.body(("Excel error: " + e.getMessage()).getBytes());
		}
	}

	private String getApproverName(Integer approverId) {
		if (approverId == null)
			return "";
		return mstUserRepository.findById(approverId).map(u -> u.getFirstName()).orElse("");
	}

	public ResponseEntity<byte[]> printexcelreportForMaterial(int headerId, int userId) {

		try {
			// ================== 1. FETCH DATA ==================
			ResponseDTO<ItemRequisitionDTO> response = prepareItemRequisitionData(headerId);
			ItemRequisitionDTO dto = response != null ? response.getData() : null;

			if (dto == null) {
				return ResponseEntity.badRequest().body("No data found".getBytes());
			}

			SimpleDateFormat sdf = new SimpleDateFormat("dd-MM-yyyy");
			DecimalFormat df = new DecimalFormat("##,##,##0.000");

			// ================== 2. WORKBOOK ==================
			HSSFWorkbook workbook = new HSSFWorkbook();
			HSSFSheet sheet = workbook.createSheet(Optional.ofNullable(dto.getReqNo()).orElse("Item_Requisition"));

			// ================== 3. STYLES ==================
			Font bold = workbook.createFont();
			bold.setBold(true);

			CellStyle header = workbook.createCellStyle();
			header.setFont(bold);
			header.setAlignment(HorizontalAlignment.CENTER);
			header.setBorderBottom(BorderStyle.THIN);
			header.setBorderTop(BorderStyle.THIN);
			header.setBorderLeft(BorderStyle.THIN);
			header.setBorderRight(BorderStyle.THIN);

			CellStyle right = workbook.createCellStyle();
			right.setAlignment(HorizontalAlignment.RIGHT);
			right.setBorderBottom(BorderStyle.THIN);
			right.setBorderTop(BorderStyle.THIN);
			right.setBorderLeft(BorderStyle.THIN);
			right.setBorderRight(BorderStyle.THIN);

			int rowCount = 0;
			Row row;
			Cell cell;

			// ================== 4. HEADER ==================
			row = sheet.createRow(rowCount++);
			cell = row.createCell(0);
			cell.setCellValue("ITEM REQUISITION REPORT");
			cell.setCellStyle(header);
			sheet.addMergedRegion(new CellRangeAddress(0, 0, 0, 15));

			row = sheet.createRow(rowCount++);
			row.createCell(0).setCellValue("Generated By:");
			row.createCell(1).setCellValue(getApproverName(userId));
			row.createCell(4).setCellValue("Generated Date:");
			row.createCell(5).setCellValue(sdf.format(new Date()));

			row = sheet.createRow(rowCount++);
			row.createCell(0).setCellValue("Location:");
			row.createCell(1).setCellValue(dto.getLocationCode() + " - " + dto.getLocationName());

			row = sheet.createRow(rowCount++);
			row.createCell(0).setCellValue("From Date:");
			row.createCell(1).setCellValue(sdf.format(dto.getFromDates()));
			row.createCell(4).setCellValue("To Date:");
			row.createCell(5).setCellValue(sdf.format(dto.getToDates()));

			rowCount++; // space

			// ================== 5. COLUMN HEADERS ==================
			row = sheet.createRow(rowCount++);
			String[] baseHeaders = { "S.No", "Category", "Item Code", "Item Name", "Package ID", "Package Price",
					"Chef Unit", "Cost Price" };

			for (int i = 0; i < baseHeaders.length; i++) {
				cell = row.createCell(i);
				cell.setCellValue(baseHeaders[i]);
				cell.setCellStyle(header);
				sheet.setColumnWidth(i, 5000);
			}

			int dateStartCol = baseHeaders.length;

			// ================== 6. DATE COLUMNS (NO LAMBDA) ==================
			Map<String, Integer> dateColumnMap = new LinkedHashMap<>();

			if (dto.getDateWiseItemList() != null && !dto.getDateWiseItemList().isEmpty()) {
				List<String> sortedDates = new ArrayList<>(dto.getDateWiseItemList().keySet());
				Collections.sort(sortedDates);

				for (String date : sortedDates) {
					cell = row.createCell(dateStartCol);
					cell.setCellValue(date);
					cell.setCellStyle(header);
					dateColumnMap.put(date, dateStartCol);
					dateStartCol++;
				}
			}

			int qtyCol = dateStartCol++;
			int adjCol = dateStartCol++;
			int finalQtyCol = dateStartCol++;
			int costCol = dateStartCol++;
			int reqTypeCol = dateStartCol;

			row.createCell(qtyCol).setCellValue("Quantity");
			row.createCell(adjCol).setCellValue("Add / Remove");
			row.createCell(finalQtyCol).setCellValue("Final Qty");
			row.createCell(costCol).setCellValue("Cost");
			row.createCell(reqTypeCol).setCellValue("Request Type");

			// ================== 7. CONSOLIDATE ITEMS ==================
			Map<String, ItemRequisitionDTO> consolidated = new LinkedHashMap<>();

			// 7.1 DATE-WISE ITEMS
			if (dto.getDateWiseItemList() != null) {
				for (Map.Entry<String, List<ItemRequisitionDTO>> entry : dto.getDateWiseItemList().entrySet()) {

					String date = entry.getKey();
					for (ItemRequisitionDTO i : entry.getValue()) {

						if (!consolidated.containsKey(i.getItemCode())) {
							ItemRequisitionDTO c = new ItemRequisitionDTO();
							c.setItemCode(i.getItemCode());
							c.setItemName(i.getItemName());
							c.setItemCategoryName(i.getItemCategoryName());
							c.setPackageId(i.getPackageId());
							c.setPackagePrice(i.getPackagePrice());
							c.setChefUnit(i.getChefUnit());
							c.setCostPrice(i.getCostPrice());
							c.setBaseQuantity(0.0);
							c.setAdjustedQuantity(0.0);
							c.setDateQuantities(new HashMap<>());
							consolidated.put(i.getItemCode(), c);
						}

						ItemRequisitionDTO c = consolidated.get(i.getItemCode());
						c.getDateQuantities().put(date, i.getBaseQuantity());
						c.setBaseQuantity(c.getBaseQuantity() + i.getBaseQuantity());
					}
				}
			}

			// 7.2 ITEM LIST (ADD / REMOVE)
			if (dto.getItemList() != null) {
				for (ItemRequisitionDTO i : dto.getItemList()) {

					if (!consolidated.containsKey(i.getItemCode())) {
						ItemRequisitionDTO c = new ItemRequisitionDTO();
						c.setItemCode(i.getItemCode());
						c.setItemName(i.getItemName());
						c.setItemCategoryName(i.getItemCategoryName());
						c.setPackageId(i.getPackageId());
						c.setPackagePrice(i.getPackagePrice());
						c.setChefUnit(i.getChefUnit());
						c.setCostPrice(i.getCostPrice());
						c.setBaseQuantity(0.0);
						c.setDateQuantities(new HashMap<>());
						consolidated.put(i.getItemCode(), c);
					}

					consolidated.get(i.getItemCode()).setAdjustedQuantity(i.getAdjustedQuantity());
				}
			}

			// 7.3 ADDITIONAL ITEMS
			if (dto.getAdditionalItems() != null) {
				for (ItemRequisitionDTO i : dto.getAdditionalItems()) {

					if (!consolidated.containsKey(i.getItemCode())) {
						ItemRequisitionDTO c = new ItemRequisitionDTO();
						c.setItemCode(i.getItemCode());
						c.setItemName(i.getItemName());
						c.setItemCategoryName(i.getItemCategoryName());
						c.setPackageId(i.getPackageId());
						c.setPackagePrice(i.getPackagePrice());
						c.setChefUnit(i.getChefUnit());
						c.setCostPrice(i.getCostPrice());
						c.setBaseQuantity(0.0);
						c.setDateQuantities(new HashMap<>());
						consolidated.put(i.getItemCode(), c);
					}

					consolidated.get(i.getItemCode()).setAdjustedQuantity(i.getAdjustedQuantity());
				}
			}

			// ================== 8. WRITE DATA ==================
			int sno = 1;
			double grandTotal = 0;

			for (ItemRequisitionDTO item : consolidated.values()) {

				row = sheet.createRow(rowCount++);

				double adjQty = item.getAdjustedQuantity() != 0 ? item.getAdjustedQuantity() : 0.0;

				double finalQty = item.getBaseQuantity() + adjQty;
				double cost = finalQty * item.getCostPrice();
				grandTotal += cost;

				row.createCell(0).setCellValue(sno++);
				row.createCell(1).setCellValue(item.getItemCategoryName());
				row.createCell(2).setCellValue(item.getItemCode());
				row.createCell(3).setCellValue(item.getItemName());
				row.createCell(4).setCellValue(item.getPackageId());
				row.createCell(5).setCellValue(df.format(item.getPackagePrice()));
				row.createCell(6).setCellValue(item.getChefUnit());
				row.createCell(7).setCellValue(df.format(item.getCostPrice()));

				for (Map.Entry<String, Integer> e : dateColumnMap.entrySet()) {
					double qty = item.getDateQuantities().getOrDefault(e.getKey(), 0.0);
					row.createCell(e.getValue()).setCellValue(df.format(qty));
				}

				row.createCell(qtyCol).setCellValue(df.format(item.getBaseQuantity()));
				row.createCell(adjCol).setCellValue(df.format(adjQty));
				row.createCell(finalQtyCol).setCellValue(df.format(finalQty));
				row.createCell(costCol).setCellValue(df.format(cost));
				row.createCell(reqTypeCol).setCellValue(adjQty > 0 ? "Additional Item" : "Menu Item");
			}

			// ================== 9. GRAND TOTAL ==================
			row = sheet.createRow(rowCount++);
			row.createCell(costCol - 1).setCellValue("Grand Total:");
			row.createCell(costCol).setCellValue(df.format(grandTotal));

			// ================== 10. RESPONSE ==================
			ByteArrayOutputStream out = new ByteArrayOutputStream();
			workbook.write(out);
			workbook.close();

			HttpHeaders headersResp = new HttpHeaders();
			headersResp.setContentType(MediaType.parseMediaType("application/vnd.ms-excel"));
			headersResp.set(HttpHeaders.CONTENT_DISPOSITION,
					"attachment; filename=" + dto.getReqNo() + "_ItemRequisition.xls");

			return new ResponseEntity<>(out.toByteArray(), headersResp, HttpStatus.OK);

		} catch (Exception e) {
			e.printStackTrace();
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
					.body(("Excel error: " + e.getMessage()).getBytes());
		}
	}

	public ResponseEntity<byte[]> printCsvReportForMaterial(int id, int userId) {

		try {
			// ================= FETCH DATA =================
			ResponseDTO<ItemRequisitionDTO> response = prepareItemRequisitionData(id);
			ItemRequisitionDTO dto = response != null ? response.getData() : null;

			if (dto == null) {
				return ResponseEntity.badRequest().body(("No data found for requisition ID: " + id).getBytes());
			}

			StringBuilder sb = new StringBuilder();
			SimpleDateFormat sdf = new SimpleDateFormat("dd-MM-yyyy");

			// ================= HEADER =================
			sb.append("Item Requisition Report\n");
			sb.append("Menu Based Raw Material Requirement\n");
			sb.append("Generated By,\"").append(getApproverName(userId)).append("\"\n");
			sb.append("Generated Date,").append(sdf.format(new Date())).append("\n");
			sb.append("Location,\"").append(dto.getLocationCode()).append(" - ").append(dto.getLocationName())
					.append("\"\n");
			sb.append("From Date,").append(sdf.format(dto.getFromDates())).append(",To Date,")
					.append(sdf.format(dto.getToDates())).append("\n\n");

			// ================= COLUMN HEADERS =================
			sb.append("S.No,Category Id,Item Code,Item Name,Package ID,").append("Package Price,Chef Unit,Cost Price,");

			// collect dates
			Set<String> allDates = new TreeSet<>();
			if (dto.getDateWiseItemList() != null) {
				allDates.addAll(dto.getDateWiseItemList().keySet());
			}

			for (String date : allDates) {
				sb.append(date).append(",");
			}

			sb.append("Quantity,Add / Remove,Final Qty,Cost,Item Type\n");

			// ================= CONSOLIDATION =================
			Map<String, ItemRequisitionDTO> consolidated = new LinkedHashMap<>();

			// Date-wise items
			if (dto.getDateWiseItemList() != null) {
				for (Map.Entry<String, List<ItemRequisitionDTO>> e : dto.getDateWiseItemList().entrySet()) {
					String date = e.getKey();
					for (ItemRequisitionDTO i : e.getValue()) {

						consolidated.computeIfAbsent(i.getItemCode(), k -> {
							ItemRequisitionDTO c = new ItemRequisitionDTO();
							c.setItemCode(i.getItemCode());
							c.setItemName(i.getItemName());
							c.setItemCategoryName(i.getItemCategoryName());
							c.setPackageId(i.getPackageId());
							c.setPackagePrice(i.getPackagePrice());
							c.setChefUnit(i.getChefUnit());
							c.setCostPrice(i.getCostPrice());
							c.setBaseQuantity(0.0);
							c.setAdjustedQuantity(0.0);
							c.setDateQuantities(new HashMap<>());
							return c;
						});

						ItemRequisitionDTO c = consolidated.get(i.getItemCode());
						c.getDateQuantities().put(date, i.getBaseQuantity());
						c.setBaseQuantity(c.getBaseQuantity() + i.getBaseQuantity());
					}
				}
			}

			// Add / Remove
			if (dto.getItemList() != null) {
				for (ItemRequisitionDTO i : dto.getItemList()) {
					consolidated.computeIfAbsent(i.getItemCode(), k -> {
						ItemRequisitionDTO c = new ItemRequisitionDTO();
						c.setItemCode(i.getItemCode());
						c.setItemName(i.getItemName());
						c.setItemCategoryName(i.getItemCategoryName());
						c.setPackageId(i.getPackageId());
						c.setPackagePrice(i.getPackagePrice());
						c.setChefUnit(i.getChefUnit());
						c.setCostPrice(i.getCostPrice());
						c.setBaseQuantity(0.0);
						c.setAdjustedQuantity(0.0);
						c.setDateQuantities(new HashMap<>());
						return c;
					});

					consolidated.get(i.getItemCode()).setAdjustedQuantity(
							consolidated.get(i.getItemCode()).getAdjustedQuantity() + i.getAdjustedQuantity());
				}
			}

			// Additional items
			if (dto.getAdditionalItems() != null) {
				for (ItemRequisitionDTO i : dto.getAdditionalItems()) {
					consolidated.computeIfAbsent(i.getItemCode(), k -> {
						ItemRequisitionDTO c = new ItemRequisitionDTO();
						c.setItemCode(i.getItemCode());
						c.setItemName(i.getItemName());
						c.setItemCategoryName(i.getItemCategoryName());
						c.setPackageId(i.getPackageId());
						c.setPackagePrice(i.getPackagePrice());
						c.setChefUnit(i.getChefUnit());
						c.setCostPrice(i.getCostPrice());
						c.setBaseQuantity(0.0);
						c.setAdjustedQuantity(0.0);
						c.setDateQuantities(new HashMap<>());
						return c;
					});

					consolidated.get(i.getItemCode()).setAdjustedQuantity(
							consolidated.get(i.getItemCode()).getAdjustedQuantity() + i.getAdjustedQuantity());
				}
			}

			// ================= WRITE ROWS =================
			int sno = 1;
			double grandTotal = 0;

			for (ItemRequisitionDTO item : consolidated.values()) {

				double baseQty = item.getBaseQuantity();
				double adjQty = item.getAdjustedQuantity();
				double finalQty = baseQty + adjQty;
				double cost = finalQty * item.getCostPrice();
				grandTotal += cost;

				sb.append(sno++).append(",");
				sb.append(q(item.getItemCategoryName())).append(",");
				sb.append(q(item.getItemCode())).append(",");
				sb.append(q(item.getItemName())).append(",");
				sb.append(q(item.getPackageId())).append(",");
				sb.append(formatDecimal(item.getPackagePrice())).append(",");
				sb.append(q(item.getChefUnit())).append(",");
				sb.append(formatDecimal(item.getCostPrice())).append(",");

				for (String date : allDates) {
					sb.append(formatDecimal(item.getDateQuantities().getOrDefault(date, 0.0))).append(",");
				}

				sb.append(formatDecimal(baseQty)).append(",");
				sb.append(formatDecimal(adjQty)).append(",");
				sb.append(formatDecimal(finalQty)).append(",");
				sb.append(formatDecimal(cost)).append(",");
				sb.append(adjQty != 0 ? "Additional Item" : "Menu Item").append("\n");
			}

			// ================= FOOTER =================
			sb.append("\nTotal Items,").append(consolidated.size()).append("\n");
			sb.append("Grand Total Cost,").append(formatDecimal(grandTotal)).append("\n");

			// ================= RESPONSE =================
			byte[] csvBytes = sb.toString().getBytes(StandardCharsets.UTF_8);

			HttpHeaders headers = new HttpHeaders();
			headers.setContentType(MediaType.parseMediaType("text/csv"));
			headers.set(HttpHeaders.CONTENT_DISPOSITION,
					"attachment; filename=\"" + dto.getReqNo() + "-RawMaterialRequirement.csv\"");

			return new ResponseEntity<>(csvBytes, headers, HttpStatus.OK);

		} catch (Exception e) {
			e.printStackTrace();
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
					.body(("Error generating CSV: " + e.getMessage()).getBytes());
		}
	}

	/* ===== helper ===== */
	private String ns(String v) {
		return v != null ? v : "";
	}

	private String q(String value) {
		if (value == null) {
			return "\"\"";
		}
		// Escape double quotes for CSV
		return "\"" + value.replace("\"", "\"\"") + "\"";
	}

// Estimation 
	public ResponseDTO<ItemRequisitionDTO> saveEstimation(ItemRequisitionDTO dto) {
		ResponseDTO<ItemRequisitionDTO> response = new ResponseDTO<>();

		try {

			if (dto != null) {

				// Category group map
				Map<String, String> categoryGroupMap = mstItemCategoryRepository.findAll().stream().collect(
						Collectors.toMap(MstItemCategoryHib::getCategoryName, MstItemCategoryHib::getCategoryGroup));

				// All headers for selected location + date
				List<ItemReqHHib> dateList = itemReqHRepository.findByLocationAndDate(dto.getLocationFk(),
						dto.getSingleDates());

				// ---------- LOOP EACH ITEM REQ HEADER ----------
				for (ItemReqHHib date : dateList) {

					// ===== MENU IDS =====
					List<Integer> menuIds = parseMenuFk(date.getMenuFk());

					// ===== ISSUE MENU DATA =====
					List<Object[]> issueList = issueMenuMRepository.findDetailsByIds(menuIds);

					// group by issue date → sum pob & cost
					Map<Date, double[]> grouped = new HashMap<>();

					for (Object[] row : issueList) {

						// menu_date is String
						String dateStr = (String) row[0];

						LocalDate ld = LocalDate.parse(dateStr); // or provide formatter if needed
						Date issueDate = Date.from(ld.atStartOfDay(ZoneId.systemDefault()).toInstant());

						double pob = row[1] != null ? ((Number) row[1]).doubleValue() : 0.0;
						double cost = row[2] != null ? ((Number) row[2]).doubleValue() : 0.0;

						grouped.compute(issueDate, (k, v) -> {
							if (v == null)
								v = new double[] { 0.0, 0.0 };
							v[0] += pob;
							v[1] += cost;
							return v;
						});
					}

					// ---------- LOOP EACH ISSUE DATE ----------
					for (Map.Entry<Date, double[]> e : grouped.entrySet()) {

						Date issueDate = e.getKey();
						double totalPob = e.getValue()[0];
						double totalCost = e.getValue()[1];

						// ===== SAVE ESTIMATED HEADER =====
						EstimatedHHib header = new EstimatedHHib();
						header.setLocationFk(date.getLocationFk());
						header.setDate(issueDate);
						header.setTotalPob(totalPob);
						header.setTotalCost(totalCost);
						header.setStatus("A");
						header.setCreatedBy(dto.getCreatedBy());
						header.setCreatedDate(new Date());

						header = estimatedHRepository.save(header);
						Integer headerId = header.getId();

						// ===== GET ONLY THIS HEADER'S DETAILS (IMPORTANT FIX) =====
						List<ItemReqDHib> dList = itemReqDRepository.findByHeaderFk(date.getId());

						// ===== FILTER DETAILS BY SAME DATE =====
						List<ItemReqDHib> filteredList = dList.stream().filter(d -> isSameDate(d.getDate(), issueDate))
								.toList();

						// ===== GROUP BY ITEM CODE =====
						Map<String, List<ItemReqDHib>> groupedItems = filteredList.stream()
								.collect(Collectors.groupingBy(ItemReqDHib::getItemCode));

						// ---------- SAVE DETAIL ROWS ----------
						for (List<ItemReqDHib> items : groupedItems.values()) {

							ItemReqDHib first = items.get(0);

							EstimatedDHib estimation = new EstimatedDHib();

							estimation.setEstimationHFk(headerId);

							estimation.setSubCategoryFk(first.getCategoryFk());
							estimation.setSubCategoryName(first.getCategory());
							estimation.setItemCode(first.getItemCode());
							estimation.setItemName(first.getItemName());
							estimation.setPackageId(first.getPackageId());
							estimation.setPackagePrice(first.getPackagePrice());
							estimation.setPackageBaseFactor(first.getPackageBaseFactor());
							estimation.setPackageSecondaryFactor(first.getPackageSecondaryFactor());
							estimation.setPackageBaseUnit(first.getPackageBaseUnit());
							estimation.setPackageSecondaryUnit(first.getPackageSecondaryUnit());
							estimation.setPackageSecondaryCost(first.getPackageSecondaryCost());
							estimation.setBaseQuantity(first.getBaseQuantity());
							estimation.setChefUnit(first.getChefUnit());

							// sum duplicate qty & cost
							double totalSecondaryQty = items.stream().mapToDouble(ItemReqDHib::getSecondaryQuantity)
									.sum();

							double totalItemCost = items.stream().mapToDouble(ItemReqDHib::getCost).sum();

							estimation.setSecondaryQuantity(totalSecondaryQty);
							estimation.setCost(totalItemCost);

							// category group
							String mainCategory = categoryGroupMap.get(first.getCategory());
							estimation.setMainCategoryName(mainCategory != null ? mainCategory : "");

							estimation.setDate(issueDate);

							estimatedDRepository.save(estimation);
						}
					}
				}
			}

		} catch (Exception e) {
			log.error(AppConstants.EXCEPTION_SAVING + " Estimation", e);
			response.setSuccess(AppConstants.FALSE);
			response.setMessage(AppConstants.EXCEPTION_SAVING);
		}

		return response;
	}
}
