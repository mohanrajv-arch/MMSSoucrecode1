package com.esfita.dto;

public class CommonAdminDTO {

	private int pk;
	private int entityFk;
	private String dateFormat;
	private String dateTimeFormat;
	private String timeZone;
	private String currency;
	private String status;
	private String fileUpload;
	private int qtyDecimal;
	private int costDecimal;
	private String numberFormat;
	private String screenLogo;
	private String reportLogo;

	public int getPk() {
		return pk;
	}

	public void setPk(int pk) {
		this.pk = pk;
	}

	public int getEntityFk() {
		return entityFk;
	}

	public void setEntityFk(int entityFk) {
		this.entityFk = entityFk;
	}

	public String getDateFormat() {
		return dateFormat;
	}

	public void setDateFormat(String dateFormat) {
		this.dateFormat = dateFormat;
	}

	public String getDateTimeFormat() {
		return dateTimeFormat;
	}

	public void setDateTimeFormat(String dateTimeFormat) {
		this.dateTimeFormat = dateTimeFormat;
	}

	public String getTimeZone() {
		return timeZone;
	}

	public void setTimeZone(String timeZone) {
		this.timeZone = timeZone;
	}

	public String getCurrency() {
		return currency;
	}

	public void setCurrency(String currency) {
		this.currency = currency;
	}

	public String getStatus() {
		return status;
	}

	public void setStatus(String status) {
		this.status = status;
	}

	public String getFileUpload() {
		return fileUpload;
	}

	public void setFileUpload(String fileUpload) {
		this.fileUpload = fileUpload;
	}

	public int getQtyDecimal() {
		return qtyDecimal;
	}

	public void setQtyDecimal(int qtyDecimal) {
		this.qtyDecimal = qtyDecimal;
	}

	public int getCostDecimal() {
		return costDecimal;
	}

	public void setCostDecimal(int costDecimal) {
		this.costDecimal = costDecimal;
	}

	public String getNumberFormat() {
		return numberFormat;
	}

	public void setNumberFormat(String numberFormat) {
		this.numberFormat = numberFormat;
	}

	public String getScreenLogo() {
		return screenLogo;
	}

	public void setScreenLogo(String screenLogo) {
		this.screenLogo = screenLogo;
	}

	public String getReportLogo() {
		return reportLogo;
	}

	public void setReportLogo(String reportLogo) {
		this.reportLogo = reportLogo;
	}

}
