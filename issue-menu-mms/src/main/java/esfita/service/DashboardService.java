package esfita.service;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collector;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import esfita.common.AppConstants;
import esfita.common.ResponseDTO;
import esfita.dto.EstimatedDashboardDTO;
import esfita.dto.StockDasboardDTO;
import esfita.entity.EstimatedHHib;
import esfita.repository.EstimatedDRepository;
import esfita.repository.EstimatedHRepository;
import esfita.utils.RestException;

@Service
public class DashboardService {
	@Autowired
	private EstimatedHRepository estimatedHRepository;
	@Autowired
	private EstimatedDRepository estimatedDRepository;
	private static final Logger log = LoggerFactory.getLogger(DashboardService.class);

	public ResponseDTO<EstimatedDashboardDTO> getEstimationSummary(EstimatedDashboardDTO estimatedDashboardDTO) {
		ResponseDTO<EstimatedDashboardDTO> response = new ResponseDTO<>();
		try {
			EstimatedDashboardDTO dto = new EstimatedDashboardDTO();

			// Convert Date to LocalDate
			LocalDate localDate = estimatedDashboardDTO.getDate().toInstant().atZone(ZoneId.systemDefault())
					.toLocalDate();
			int month = localDate.getMonthValue();
			int year = localDate.getYear();

			// 1️⃣ Fetch monthly totals
			Object result = estimatedHRepository.getSummaryTotalsNative(estimatedDashboardDTO.getLocationFk(), year,
					month);
			Double totalPob = 0.0;
			Double totalCost = 0.0;

			if (result instanceof Object[]) {
				Object[] totals = (Object[]) result;
				totalPob = totals[0] != null ? ((Number) totals[0]).doubleValue() : 0.0;
				totalCost = totals[1] != null ? ((Number) totals[1]).doubleValue() : 0.0;
			}

			dto.setTotalPob(totalPob);
			dto.setTotalCost(totalCost);

			// 2️⃣ Daily totals list
			List<EstimatedHHib> records = estimatedHRepository
					.findAllByLocationAndMonthYear(estimatedDashboardDTO.getLocationFk(), year, month);
//	        List<EstimatedDashboardDTO> dailyList = records.stream()
//	            .map(hib -> {
//	                EstimatedDashboardDTO dailyDto = new EstimatedDashboardDTO();
//	                dailyDto.setDate(hib.getDate());
//	                dailyDto.setTotalPob(hib.getTotalPob());
//	                dailyDto.setTotalCost(hib.getTotalCost());
//	                return dailyDto;
//	            })
//	            .toList();
			List<EstimatedDashboardDTO> dailyList = records.stream()
					.collect(Collectors.groupingBy(EstimatedHHib::getDate, // key = date
							Collector.of(() -> {
								EstimatedDashboardDTO d = new EstimatedDashboardDTO();
								d.setTotalPob(0.0);
								d.setTotalCost(0.0);
								return d;
							}, (dtoTmp, hib) -> {
								dtoTmp.setDate(hib.getDate());

								dtoTmp.setTotalPob(
										dtoTmp.getTotalPob() + (hib.getTotalPob() != null ? hib.getTotalPob() : 0.0));

								dtoTmp.setTotalCost(dtoTmp.getTotalCost()
										+ (hib.getTotalCost() != null ? hib.getTotalCost() : 0.0));
							}, (a, b) -> a)))
					.values().stream().sorted(Comparator.comparing(EstimatedDashboardDTO::getDate)) // optional
					.toList();

			dto.setDailyList(dailyList); // daily totals

			// 3️⃣ Main-category-wise totals per header
			List<EstimatedDashboardDTO> mainCategoryList = records.stream()
					.flatMap(hib -> estimatedDRepository.itemList(hib.getId()).stream().map(d -> {
						EstimatedDashboardDTO detail = new EstimatedDashboardDTO();
						detail.setDate(d.getDate());
						detail.setSubCategoryFk(d.getSubCategoryFk());
						detail.setSubCategoryName(d.getSubCategoryName());
						detail.setMainCategoryName(d.getMainCategoryName());
						detail.setItemCode(d.getItemCode());
						detail.setItemName(d.getItemName());
						detail.setPackageId(d.getPackageId());
						detail.setPackagePrice(d.getPackagePrice());
						detail.setPackageBaseFactor(d.getPackageBaseFactor());
						detail.setPackageSecondaryFactor(d.getPackageSecondaryFactor());
						detail.setPackageBaseUnit(d.getPackageBaseUnit());
						detail.setPackageSecondaryUnit(d.getPackageSecondaryUnit());
						detail.setPackageSecondaryCost(d.getPackageSecondaryCost());
						detail.setBaseQuantity(d.getBaseQuantity());
						detail.setSecondaryQuantity(d.getSecondaryQuantity());
						detail.setChefUnit(d.getChefUnit());
						detail.setCost(d.getCost());
						return detail;
					})).toList();
			dto.setMainCategoryList(mainCategoryList);

			// ✅ Finalize response
			response.setData(dto);
			response.setSuccess(AppConstants.TRUE);
			response.setMessage(AppConstants.MSG_RECORD_FETCHED);
		} catch (Exception e) {
			log.error("Error fetching Estimation Summary", e);
			response.setSuccess(AppConstants.FALSE);
			response.setMessage("Failed to fetch estimation summary");
		}

		return response;
	}

	public ResponseDTO<List<StockDasboardDTO>> estimationList(int locFk) {
		ResponseDTO<List<StockDasboardDTO>> response = new ResponseDTO<>();
		List<StockDasboardDTO> estimationList = new ArrayList<>();

		try {
			List<Object[]> list = estimatedHRepository.listOfEstimation(locFk);
			if (list != null && !list.isEmpty()) {
				for (Object[] obj : list) {
					StockDasboardDTO dto = new StockDasboardDTO();

					// h.date (convert safely)
					Object dateObj = obj[0];
					LocalDate localDate = null;

					if (dateObj instanceof java.sql.Date sqlDate) {
						localDate = sqlDate.toLocalDate();
					} else if (dateObj instanceof java.util.Date utilDate) {
						localDate = utilDate.toInstant().atZone(ZoneId.systemDefault()).toLocalDate();
					}

					dto.setDate(localDate != null ? localDate.toString() : null);

					// d.item_code
					dto.setItemCode((String) obj[1]);

					// d.item_name
					dto.setItemName((String) obj[2]);

					// d.secondary_quantity
					dto.setRequiredQty(((Number) obj[3]).doubleValue());

					estimationList.add(dto);
				}

				response.setMessage("Estimation List " + AppConstants.MSG_RECORD_FETCHED);
				response.setSuccess(AppConstants.TRUE);
			} else {
				response.setMessage("Estimation  Meal " + AppConstants.EMPTY);
				response.setSuccess(AppConstants.FALSE);
			}
			response.setData(estimationList);
		} catch (RestException re) {
			response.setSuccess(AppConstants.FALSE);
			response.setMessage(AppConstants.REST_EXCEPTION);
			log.warn(AppConstants.REST_EXCEPTION + " Estimation  list", re);
		} catch (Exception e) {
			response.setSuccess(AppConstants.FALSE);
			log.error(AppConstants.EXCEPTION + " Estimation  list", e);
			response.setMessage(AppConstants.EXCEPTION);
		}
		log.info("Completed Estimation  retrieval process.");
		return response;
	}

//	public ResponseDTO<List<StockDasboardDTO>> estimationStockList(int locFk) {
//	    ResponseDTO<List<StockDasboardDTO>> response = new ResponseDTO<>();
//	    List<StockDasboardDTO> estimationList = new ArrayList<>();
//
//	    try {
//	        List<Object[]> list = estimatedHRepository.listOfEstimation(locFk);
//	        if (list != null && !list.isEmpty()) {
//	            for (Object[] obj : list) {
//	                StockDasboardDTO dto = new StockDasboardDTO();
//
//	                // h.date (convert safely)
//	                Object dateObj = obj[0];
//	                LocalDate localDate = null;
//	                if (dateObj instanceof java.sql.Date) {
//	                    localDate = ((java.sql.Date) dateObj).toLocalDate();
//	                } else if (dateObj instanceof java.util.Date) {
//	                    localDate = ((java.util.Date) dateObj).toInstant()
//	                            .atZone(ZoneId.systemDefault())
//	                            .toLocalDate();
//	                }
//	                dto.setDate(localDate != null ? localDate.toString() : null);
//
//	                // d.item_code
//	                dto.setItemCode((String) obj[1]);
//
//	                // d.item_name
//	                dto.setItemName((String) obj[2]);
//
//	                // d.secondary_quantity
//	                dto.setRequiredQty(((Number) obj[3]).doubleValue());
//
//	                estimationList.add(dto);
//	            }
//
//	            response.setMessage("Recipe Meal List " + AppConstants.MSG_RECORD_FETCHED);
//	            response.setSuccess(AppConstants.TRUE);
//	        } else {
//	            response.setMessage("Recipe Meal " + AppConstants.EMPTY);
//	            response.setSuccess(AppConstants.FALSE);
//	        }
//	        response.setData(estimationList);
//	    } catch (RestException re) {
//	        response.setSuccess(AppConstants.FALSE);
//	        response.setMessage(AppConstants.REST_EXCEPTION);
//	        log.warn(AppConstants.REST_EXCEPTION + " Recipe Meal list", re);
//	    } catch (Exception e) {
//	        response.setSuccess(AppConstants.FALSE);
//	        log.error(AppConstants.EXCEPTION + " Recipe Meal list", e);
//	        response.setMessage(AppConstants.EXCEPTION);
//	    }
//	    log.info("Completed Recipe Meal retrieval process.");
//	    return response;
//	}

	public ResponseDTO<List<StockDasboardDTO>> stockList() {
		ResponseDTO<List<StockDasboardDTO>> response = new ResponseDTO<>();
		List<StockDasboardDTO> stockList = new ArrayList<>();

		try {
			List<Object[]> list = estimatedHRepository.stockList();
			if (list != null && !list.isEmpty()) {
				for (Object[] obj : list) {
					StockDasboardDTO dto = new StockDasboardDTO();

					dto.setCategoryGroup((String) obj[0]);
					dto.setCategoryName((String) obj[1]);
					dto.setItemCode((String) obj[2]);
					dto.setItemName((String) obj[3]);
					dto.setPackageId((String) obj[4]);
					dto.setPackageSecondaryUnit((String) obj[5]);
					dto.setAvailableQty(((Number) obj[6]).doubleValue());
					dto.setTotalQty(((Number) obj[6]).doubleValue());

					stockList.add(dto);
				}

				response.setMessage("Stock List " + AppConstants.MSG_RECORD_FETCHED);
				response.setSuccess(AppConstants.TRUE);
			} else {
				response.setMessage("Stock List " + AppConstants.EMPTY);
				response.setSuccess(AppConstants.FALSE);
			}
			response.setData(stockList);
		} catch (RestException re) {
			response.setSuccess(AppConstants.FALSE);
			response.setMessage(AppConstants.REST_EXCEPTION);
			log.warn(AppConstants.REST_EXCEPTION + " Stock list", re);
		} catch (Exception e) {
			response.setSuccess(AppConstants.FALSE);
			log.error(AppConstants.EXCEPTION + " Stock list", e);
			response.setMessage(AppConstants.EXCEPTION);
		}
		log.info("Completed Stock retrieval process.");
		return response;
	}

}
