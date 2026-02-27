package com.esfita.entity;

import java.io.Serializable;
import java.util.Date;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Data
@JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
@Table(name = "APP_PREFERENCES", schema = "dbo")
public class AppPreference implements Serializable {

	/**
	 * 
	 */
	private static final long serialVersionUID = 8383327729211469919L;

	@Id
	@GeneratedValue(strategy = GenerationType.AUTO)
	@Column(name = "AP_APP_PREFERENCES_PK", updatable = false)
	private int aP_APP_PREFERENCES_PK;

	@Column(name = "AP_AEN_ENTITY_FK")
	private int aP_AEN_ENTITY_FK;

	@Column(name = "DECIMAL_TO_VALUE")
	private int dECIMAL_TO_VALUE;

	@Column(name = "DECIMAL_TO_QTY")
	private int dECIMAL_TO_QTY;

	@Column(name = "AP_DATE_FORMAT")
	private String aP_DATE_FORMAT;

	@Column(name = "AP_DATE_TIME_FORMAT")
	private String aP_DATE_TIME_FORMAT;

	@Column(name = "AP_LAST_ACT_DATE_FORMAT")
	private String aP_LAST_ACT_DATE_FORMAT;

	@Column(name = "AP_LANGUAGE")
	private String aP_LANGUAGE;

	@Column(name = "AP_CURRENCY")
	private String aP_CURRENCY;

	@Column(name = "AP_STATUS")
	private String aP_STATUS;

	@Column(name = "AP_LAST_ACT_BY")
	private int aP_LAST_ACT_BY;

	@Column(name = "AP_LAST_ACT_DATE")
	private Date aP_LAST_ACT_DATE;

	@Column(name = "AP_FILE_UPLOAD")
	private String aP_FILE_UPLOAD;
	
	@Column(name = "number_format")
	private String nUMBER_FORMAT;
	
	@Column(name = "screen_logo")
	private String screenLogo;
	
	@Column(name = "report_logo")
	private String reportLogo;
	
	@Column(name = "recipe_modify")
	private int recipeModify;
	
	

	public int getaP_APP_PREFERENCES_PK() {
		return aP_APP_PREFERENCES_PK;
	}

	public void setaP_APP_PREFERENCES_PK(int aP_APP_PREFERENCES_PK) {
		this.aP_APP_PREFERENCES_PK = aP_APP_PREFERENCES_PK;
	}

	public int getaP_AEN_ENTITY_FK() {
		return aP_AEN_ENTITY_FK;
	}

	public void setaP_AEN_ENTITY_FK(int aP_AEN_ENTITY_FK) {
		this.aP_AEN_ENTITY_FK = aP_AEN_ENTITY_FK;
	}

	public int getdECIMAL_TO_VALUE() {
		return dECIMAL_TO_VALUE;
	}

	public void setdECIMAL_TO_VALUE(int dECIMAL_TO_VALUE) {
		this.dECIMAL_TO_VALUE = dECIMAL_TO_VALUE;
	}

	public int getdECIMAL_TO_QTY() {
		return dECIMAL_TO_QTY;
	}

	public void setdECIMAL_TO_QTY(int dECIMAL_TO_QTY) {
		this.dECIMAL_TO_QTY = dECIMAL_TO_QTY;
	}

	public String getaP_DATE_FORMAT() {
		return aP_DATE_FORMAT;
	}

	public void setaP_DATE_FORMAT(String aP_DATE_FORMAT) {
		this.aP_DATE_FORMAT = aP_DATE_FORMAT;
	}

	public String getaP_DATE_TIME_FORMAT() {
		return aP_DATE_TIME_FORMAT;
	}

	public void setaP_DATE_TIME_FORMAT(String aP_DATE_TIME_FORMAT) {
		this.aP_DATE_TIME_FORMAT = aP_DATE_TIME_FORMAT;
	}

	public String getaP_LAST_ACT_DATE_FORMAT() {
		return aP_LAST_ACT_DATE_FORMAT;
	}

	public void setaP_LAST_ACT_DATE_FORMAT(String aP_LAST_ACT_DATE_FORMAT) {
		this.aP_LAST_ACT_DATE_FORMAT = aP_LAST_ACT_DATE_FORMAT;
	}

	public String getaP_LANGUAGE() {
		return aP_LANGUAGE;
	}

	public void setaP_LANGUAGE(String aP_LANGUAGE) {
		this.aP_LANGUAGE = aP_LANGUAGE;
	}

	public String getaP_CURRENCY() {
		return aP_CURRENCY;
	}

	public void setaP_CURRENCY(String aP_CURRENCY) {
		this.aP_CURRENCY = aP_CURRENCY;
	}

	public String getaP_STATUS() {
		return aP_STATUS;
	}

	public void setaP_STATUS(String aP_STATUS) {
		this.aP_STATUS = aP_STATUS;
	}

	public int getaP_LAST_ACT_BY() {
		return aP_LAST_ACT_BY;
	}

	public void setaP_LAST_ACT_BY(int aP_LAST_ACT_BY) {
		this.aP_LAST_ACT_BY = aP_LAST_ACT_BY;
	}

	public Date getaP_LAST_ACT_DATE() {
		return aP_LAST_ACT_DATE;
	}

	public void setaP_LAST_ACT_DATE(Date aP_LAST_ACT_DATE) {
		this.aP_LAST_ACT_DATE = aP_LAST_ACT_DATE;
	}

	public String getaP_FILE_UPLOAD() {
		return aP_FILE_UPLOAD;
	}

	public void setaP_FILE_UPLOAD(String aP_FILE_UPLOAD) {
		this.aP_FILE_UPLOAD = aP_FILE_UPLOAD;
	}

	public String getnUMBER_FORMAT() {
		return nUMBER_FORMAT;
	}

	public void setnUMBER_FORMAT(String nUMBER_FORMAT) {
		this.nUMBER_FORMAT = nUMBER_FORMAT;
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

	public int getRecipeModify() {
		return recipeModify;
	}

	public void setRecipeModify(int recipeModify) {
		this.recipeModify = recipeModify;
	}

	
}
