package esfita.entity;

import java.util.Date;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "mst_user_access_screen", schema = "dbo")
@JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
public class MstUserAccessScreen {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "pk")
	private Integer id;

	@Column(name = "audit_fk")
	private int auditFk;

	@Column(name = "user_fk")
	private Integer userFk;

	@Column(name = "screen_name")
	private String screenName;

	@Column(name = "in_time")
	private Date inTime;

	@Column(name = "out_time")
	private Date outTime;

	@Column(name = "total_time")
	private String totalTime;

	@Column(name = "created_date")
	private Date createdDate;

	// --- Getters and Setters ---

	public Integer getId() {
		return id;
	}

	public void setId(Integer id) {
		this.id = id;
	}

	public Integer getUserFk() {
		return userFk;
	}

	public void setUserFk(Integer userFk) {
		this.userFk = userFk;
	}

	public String getScreenName() {
		return screenName;
	}

	public void setScreenName(String screenName) {
		this.screenName = screenName;
	}

	public Date getInTime() {
		return inTime;
	}

	public void setInTime(Date date) {
		this.inTime = date;
	}

	public Date getOutTime() {
		return outTime;
	}

	public void setOutTime(Date date) {
		this.outTime = date;
	}

	public String getTotalTime() {
		return totalTime;
	}

	public void setTotalTime(String totalTime) {
		this.totalTime = totalTime;
	}

	public Date getCreatedDate() {
		return createdDate;
	}

	public void setCreatedDate(Date createdDate) {
		this.createdDate = createdDate;
	}

	public int getAuditFk() {
		return auditFk;
	}

	public void setAuditFk(int auditFk) {
		this.auditFk = auditFk;
	}
}
