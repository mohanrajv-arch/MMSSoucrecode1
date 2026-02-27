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
@Table(name = "final_set_menu_m", schema = "dbo")
public class FinalSetMenuMHib implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", updatable = false)
    private int id;

    @Column(name = "name")
    private String name;

    public int getId() {
		return id;
	}

	public void setId(int id) {
		this.id = id;
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

	public int getMealTypeFk() {
		return mealTypeFk;
	}

	public void setMealTypeFk(int mealTypeFk) {
		this.mealTypeFk = mealTypeFk;
	}

	public double getTotal() {
		return total;
	}

	public void setTotal(double total) {
		this.total = total;
	}

	public int getApprovedBy() {
		return approvedBy;
	}

	public void setApprovedBy(int approvedBy) {
		this.approvedBy = approvedBy;
	}

	public int getTotalRecipeCount() {
		return totalRecipeCount;
	}

	public void setTotalRecipeCount(int totalRecipeCount) {
		this.totalRecipeCount = totalRecipeCount;
	}

	public char getStatus() {
		return status;
	}

	public void setStatus(char status) {
		this.status = status;
	}

	public int getApprovalStatus() {
		return approvalStatus;
	}

	public void setApprovalStatus(int approvalStatus) {
		this.approvalStatus = approvalStatus;
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

	@Column(name = "notes")
    private String notes;
    
    @Column(name = "meal_type_fk")
    private int mealTypeFk;

    @Column(name = "total")
    private double total;
    
    @Column(name = "approved_by")
    private int approvedBy;

    @Column(name = "total_recipe_count")
    private int totalRecipeCount;
    

    @Column(name = "status")
    private char status;
    
    @Column(name = "approval_status")
    private int approvalStatus;

    @Column(name = "created_by")
    private int createdBy;

    @Column(name = "created_date_time")
    private Date createdDateTime;

    @Column(name = "last_act_by")
    private int lastActBy;

    @Column(name = "last_act_date_time")
    private Date lastActDateTime;
}
