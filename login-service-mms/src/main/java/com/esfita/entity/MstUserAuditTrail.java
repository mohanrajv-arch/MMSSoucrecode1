package com.esfita.entity;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "mst_user_audit_trail", schema = "dbo")
@JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })

public class MstUserAuditTrail {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "muat_user_audit_trail_pk")
	private Integer id;

	@Column(name = "muat_aen_ent_fk")
	private Integer entityFk;

	@Column(name = "muat_browser_details")
	private String browserDetails;

	@Column(name = "muat_user_type")
	private Integer userType;

	@Column(name = "muat_login_time")
	private LocalDateTime loginTime;

	@Column(name = "muat_logout_time")
	private LocalDateTime logoutTime;

	@Column(name = "muat_mu_user_fk")
	private Integer userFk;

	@Column(name = "muat_user_ip_address")
	private String ipAddress;

	@Column(name = "muat_user_ipv4_address")
	private String ipv4Address;

	@Column(name = "muat_user_mac_id")
	private String macId;

	@Column(name = "muat_user_os_details")
	private String osDetails;

	@Column(name = "muat_crt_by")
	private Integer createdBy;

	@Column(name = "muat_crt_date")
	private LocalDateTime createdDate;

	// --- Getters and Setters ---

	public Integer getId() {
		return id;
	}

	public void setId(Integer id) {
		this.id = id;
	}

	public Integer getEntityFk() {
		return entityFk;
	}

	public void setEntityFk(Integer entityFk) {
		this.entityFk = entityFk;
	}

	public String getBrowserDetails() {
		return browserDetails;
	}

	public void setBrowserDetails(String browserDetails) {
		this.browserDetails = browserDetails;
	}

	public Integer getUserType() {
		return userType;
	}

	public void setUserType(Integer userType) {
		this.userType = userType;
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

	public Integer getUserFk() {
		return userFk;
	}

	public void setUserFk(Integer userFk) {
		this.userFk = userFk;
	}

	public String getIpAddress() {
		return ipAddress;
	}

	public void setIpAddress(String ipAddress) {
		this.ipAddress = ipAddress;
	}

	public String getIpv4Address() {
		return ipv4Address;
	}

	public void setIpv4Address(String ipv4Address) {
		this.ipv4Address = ipv4Address;
	}

	public String getMacId() {
		return macId;
	}

	public void setMacId(String macId) {
		this.macId = macId;
	}

	public String getOsDetails() {
		return osDetails;
	}

	public void setOsDetails(String osDetails) {
		this.osDetails = osDetails;
	}

	public Integer getCreatedBy() {
		return createdBy;
	}

	public void setCreatedBy(Integer createdBy) {
		this.createdBy = createdBy;
	}

	public LocalDateTime getCreatedDate() {
		return createdDate;
	}

	public void setCreatedDate(LocalDateTime createdDate) {
		this.createdDate = createdDate;
	}
}
