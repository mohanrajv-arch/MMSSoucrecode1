package esfita.entity;

import java.io.Serializable;
import java.util.Date;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity

@JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
@Table(name = "APP_PREFERENCES" , schema = "dbo")
public class AppPreferences implements Serializable {
	
	/**
	 * 
	 */
	private static final long serialVersionUID = 8383327729211469919L;

	@Id
	@GeneratedValue(strategy = GenerationType.AUTO)
	@Column(name = "AP_APP_PREFERENCES_PK", updatable = false)
	private int apAppPreferencesPk;

	@Column(name = "AP_AEN_ENTITY_FK")
	private int apAenEntityFk;

	@Column(name = "DECIMAL_TO_VALUE")
	private int decimalToValue;

	@Column(name = "DECIMAL_TO_QTY")
	private int decimalToQty;

	@Column(name = "AP_DATE_FORMAT")
	private String apDateFormat;

	public int getApAppPreferencesPk() {
		return apAppPreferencesPk;
	}

	public void setApAppPreferencesPk(int apAppPreferencesPk) {
		this.apAppPreferencesPk = apAppPreferencesPk;
	}

	public int getApAenEntityFk() {
		return apAenEntityFk;
	}

	public void setApAenEntityFk(int apAenEntityFk) {
		this.apAenEntityFk = apAenEntityFk;
	}

	public int getDecimalToValue() {
		return decimalToValue;
	}

	public void setDecimalToValue(int decimalToValue) {
		this.decimalToValue = decimalToValue;
	}

	public int getDecimalToQty() {
		return decimalToQty;
	}

	public void setDecimalToQty(int decimalToQty) {
		this.decimalToQty = decimalToQty;
	}

	public String getApDateFormat() {
		return apDateFormat;
	}

	public void setApDateFormat(String apDateFormat) {
		this.apDateFormat = apDateFormat;
	}

	public String getApDateTimeFormat() {
		return apDateTimeFormat;
	}

	public void setApDateTimeFormat(String apDateTimeFormat) {
		this.apDateTimeFormat = apDateTimeFormat;
	}

	public String getApLastActDateFormat() {
		return apLastActDateFormat;
	}

	public void setApLastActDateFormat(String apLastActDateFormat) {
		this.apLastActDateFormat = apLastActDateFormat;
	}

	public String getApLanguage() {
		return apLanguage;
	}

	public void setApLanguage(String apLanguage) {
		this.apLanguage = apLanguage;
	}

	public String getApCurrency() {
		return apCurrency;
	}

	public void setApCurrency(String apCurrency) {
		this.apCurrency = apCurrency;
	}

	public String getApStatus() {
		return apStatus;
	}

	public void setApStatus(String apStatus) {
		this.apStatus = apStatus;
	}

	public int getApLastActBy() {
		return apLastActBy;
	}

	public void setApLastActBy(int apLastActBy) {
		this.apLastActBy = apLastActBy;
	}

	public Date getApLastActDate() {
		return apLastActDate;
	}

	public void setApLastActDate(Date apLastActDate) {
		this.apLastActDate = apLastActDate;
	}

	public String getApFileUpload() {
		return apFileUpload;
	}

	public void setApFileUpload(String apFileUpload) {
		this.apFileUpload = apFileUpload;
	}

	public static long getSerialversionuid() {
		return serialVersionUID;
	}

	@Column(name = "AP_DATE_TIME_FORMAT")
	private String apDateTimeFormat;

	@Column(name = "AP_LAST_ACT_DATE_FORMAT")
	private String apLastActDateFormat;

	@Column(name = "AP_LANGUAGE")
	private String apLanguage;

	@Column(name = "AP_CURRENCY")
	private String apCurrency;

	@Column(name = "AP_STATUS")
	private String apStatus;

	@Column(name = "AP_LAST_ACT_BY")
	private int apLastActBy;

	@Column(name = "AP_LAST_ACT_DATE")
	private Date apLastActDate;

	@Column(name = "AP_FILE_UPLOAD")
	private String apFileUpload;
	
	@Column(name = "NUMBER_FORMAT")
	private String nUMBER_FORMAT;
	
	@Column(name = "screen_logo")
	private String screenLogo;
	
	@Column(name = "report_logo")
	private String reportLogo;

}
