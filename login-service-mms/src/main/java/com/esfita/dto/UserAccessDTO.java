package com.esfita.dto;

import java.time.LocalDateTime;
import java.util.Date;

import com.fasterxml.jackson.annotation.JsonFormat;

import lombok.Data;

@Data
public class UserAccessDTO {

	private boolean renderAdmin;
	private boolean renderSuperAdmin;
	private boolean renderLocationBasedAdmin;

	private boolean renderLocationChangeOption;

	private int retrieveType;
	private int userFk;
	private int userType;

	private String userName;
	private String userEmailId;
	private String userTypeWord;

	private String loginStr;
	private String logoutStr;

	private Date login;
	private Date logout;
	
	private LocalDateTime loginTime;
	private LocalDateTime logoutTime;
	private String ipAddress;
	private String macId;
	private String browser;
	private String osDetail;
	private String screenUrl;
	private String totalSpendTime;
	private int auditPk;
//	 Add
	@JsonFormat(pattern = "yyyy-MM-dd")
	private Date day;
	private int yearInt;

	public boolean isRenderAdmin() {
		return renderAdmin;
	}

	public void setRenderAdmin(boolean renderAdmin) {
		this.renderAdmin = renderAdmin;
	}

	public boolean isRenderSuperAdmin() {
		return renderSuperAdmin;
	}

	public void setRenderSuperAdmin(boolean renderSuperAdmin) {
		this.renderSuperAdmin = renderSuperAdmin;
	}

	public boolean isRenderLocationBasedAdmin() {
		return renderLocationBasedAdmin;
	}

	public void setRenderLocationBasedAdmin(boolean renderLocationBasedAdmin) {
		this.renderLocationBasedAdmin = renderLocationBasedAdmin;
	}

	public boolean isRenderLocationChangeOption() {
		return renderLocationChangeOption;
	}

	public void setRenderLocationChangeOption(boolean renderLocationChangeOption) {
		this.renderLocationChangeOption = renderLocationChangeOption;
	}

	public int getRetrieveType() {
		return retrieveType;
	}

	public void setRetrieveType(int retrieveType) {
		this.retrieveType = retrieveType;
	}

	public int getUserFk() {
		return userFk;
	}

	public void setUserFk(int userFk) {
		this.userFk = userFk;
	}

	public int getUserType() {
		return userType;
	}

	public void setUserType(int userType) {
		this.userType = userType;
	}

	public String getUserName() {
		return userName;
	}

	public void setUserName(String userName) {
		this.userName = userName;
	}

	public String getUserEmailId() {
		return userEmailId;
	}

	public void setUserEmailId(String userEmailId) {
		this.userEmailId = userEmailId;
	}

	public String getUserTypeWord() {
		return userTypeWord;
	}

	public void setUserTypeWord(String userTypeWord) {
		this.userTypeWord = userTypeWord;
	}

	public String getLoginStr() {
		return loginStr;
	}

	public void setLoginStr(String loginStr) {
		this.loginStr = loginStr;
	}

	public String getLogoutStr() {
		return logoutStr;
	}

	public void setLogoutStr(String logoutStr) {
		this.logoutStr = logoutStr;
	}

	public Date getLogin() {
		return login;
	}

	public void setLogin(Date localDateTime) {
		this.login = localDateTime;
	}

	public Date getLogout() {
		return logout;
	}

	public void setLogout(Date localDateTime) {
		this.logout = localDateTime;
	}

	public String getIpAddress() {
		return ipAddress;
	}

	public void setIpAddress(String ipAddress) {
		this.ipAddress = ipAddress;
	}

	public String getMacId() {
		return macId;
	}

	public void setMacId(String macId) {
		this.macId = macId;
	}

	public String getBrowser() {
		return browser;
	}

	public void setBrowser(String browser) {
		this.browser = browser;
	}

	public String getOsDetail() {
		return osDetail;
	}

	public void setOsDetail(String osDetail) {
		this.osDetail = osDetail;
	}

	public Date getDay() {
		return day;
	}

	public void setDay(Date day) {
		this.day = day;
	}

	public int getYearInt() {
		return yearInt;
	}

	public void setYearInt(int yearInt) {
		this.yearInt = yearInt;
	}

	public String getScreenUrl() {
		return screenUrl;
	}

	public void setScreenUrl(String screenUrl) {
		this.screenUrl = screenUrl;
	}

	public String getTotalSpendTime() {
		return totalSpendTime;
	}

	public void setTotalSpendTime(String totalSpendTime) {
		this.totalSpendTime = totalSpendTime;
	}

	public int getAuditPk() {
		return auditPk;
	}

	public void setAuditPk(int auditPk) {
		this.auditPk = auditPk;
	}

	public LocalDateTime getLoginTime() {
		return loginTime;
	}

	public void setLoginTime(LocalDateTime loginTime) {
		this.loginTime = loginTime;
	}

	public LocalDateTime getLogoutTime() {
		return logoutTime;
	}

	public void setLogoutTime(LocalDateTime logoutTime) {
		this.logoutTime = logoutTime;
	}

}
