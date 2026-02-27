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
import esfita.dto.EstimatedDashboardDTO;
import esfita.dto.StockDasboardDTO;
import esfita.service.DashboardService;
import io.micrometer.observation.annotation.Observed;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/dashboardController")
public class DashboardController {

	@Autowired
	DashboardService dashboardService;

	@Tag(name = "Estimation Dashboard")
	@PostMapping("/getEstimationSummary")
	@Observed(name = "getEstimationSummary", contextualName = "getEstimationSummary")
	public ResponseDTO<EstimatedDashboardDTO> getEstimationSummary(
			@RequestBody EstimatedDashboardDTO estimatedDashboardDTO) {
		return dashboardService.getEstimationSummary(estimatedDashboardDTO);
	}

	@Tag(name = "Stock  Dashboard")
	@GetMapping("/estimationList/{locFk}")
	@Observed(name = "estimationList", contextualName = "estimationList")
	public ResponseDTO<List<StockDasboardDTO>> estimationList(@PathVariable("locFk") int locFk) {
		return dashboardService.estimationList(locFk);
	}

	@Tag(name = "Stock  Dashboard")
	@GetMapping("/stockList")
	@Observed(name = "stockList", contextualName = "stockList")
	public ResponseDTO<List<StockDasboardDTO>> stockList() {
		return dashboardService.stockList();
	}
}
