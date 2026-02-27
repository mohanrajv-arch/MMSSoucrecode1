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
import lombok.Data;

@Entity
@Data
@JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
@Table(name = "issue_menu_m", schema = "dbo") // Adjust schema if needed
public class IssueMenuMHib implements Serializable {

	/**
	 * 
	 */
	private static final long serialVersionUID = -828013818909151958L;

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "id", updatable = false)
	private int id;

	public int getId() {
		return id;
	}

	public void setId(int id) {
		this.id = id;
	}

	public int getFinalMenuFk() {
		return finalMenuFk;
	}

	public void setFinalMenuFk(int finalMenuFk) {
		this.finalMenuFk = finalMenuFk;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public String getNotes() {
		return notes;
	}

	public void setNotes(String notes) {
		this.notes = notes;
	}

	public int getLocationFk() {
		return locationFk;
	}

	public void setLocationFk(int locationFk) {
		this.locationFk = locationFk;
	}

	public String getMenuDate() {
		return menuDate;
	}

	public void setMenuDate(String menuDate) {
		this.menuDate = menuDate;
	}

	public double getPob() {
		return pob;
	}

	public void setPob(double pob) {
		this.pob = pob;
	}

	public double getActualPob() {
		return actualPob;
	}

	public void setActualPob(double actualPob) {
		this.actualPob = actualPob;
	}

	public double getTotal() {
		return total;
	}

	public void setTotal(double total) {
		this.total = total;
	}

	public char getStatus() {
		return status;
	}

	public void setStatus(char status) {
		this.status = status;
	}

	public int getIssueStatus() {
		return issueStatus;
	}

	public void setIssueStatus(int issueStatus) {
		this.issueStatus = issueStatus;
	}

	public int getCreatedBy() {
		return createdBy;
	}

	public void setCreatedBy(int createdBy) {
		this.createdBy = createdBy;
	}

	public Date getCreatedDateTime() {
		return createdDateTime;
	}

	public void setCreatedDateTime(Date createdDateTime) {
		this.createdDateTime = createdDateTime;
	}

	public int getLastActBy() {
		return lastActBy;
	}

	public void setLastActBy(int lastActBy) {
		this.lastActBy = lastActBy;
	}

	public Date getLastActDateTime() {
		return lastActDateTime;
	}

	public void setLastActDateTime(Date lastActDateTime) {
		this.lastActDateTime = lastActDateTime;
	}

	public static long getSerialversionuid() {
		return serialVersionUID;
	}

	@Column(name = "final_menu_fk")
	private int finalMenuFk;

	@Column(name = "name")
	private String name;

	@Column(name = "notes")
	private String notes;

	@Column(name = "location_fk")
	private int locationFk;

	@Column(name = "menu_date")
	private String menuDate;

	@Column(name = "pob")
	private double pob;
	
	@Column(name = "actual_pob")
	private double actualPob;

	@Column(name = "total")
	private double total;

	@Column(name = "status")
	private char status;

	@Column(name = "issue_status")
	private int issueStatus;

	@Column(name = "created_by")
	private int createdBy;

	@Column(name = "created_date_time")
	private Date createdDateTime;

	@Column(name = "last_act_by")
	private int lastActBy;

	@Column(name = "last_act_date_time")
	private Date lastActDateTime;
}


