package esfita.entity;
 
import java.io.Serializable;
import java.util.Date;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;
 
@Entity
@Data
@Table(name = "recipe_meal_mapping_master", schema = "dbo")
public class RecipeMealMappingHib implements Serializable {
 
	/**
	 * 
	 * 
	 */
	private static final long serialVersionUID = -7770940542823551064L;
 
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "id", updatable = false)
	private int id;
	
	@Column(name = "meal_fk")
	private int mealFk;
	
	@Column(name = "recipe_fk")
	
	private int recipeFk;

	@Column(name = "status")
	private char status;
	
	public int getId() {
		return id;
	}

	public void setId(int id) {
		this.id = id;
	}

	public int getMealFk() {
		return mealFk;
	}

	public void setMealFk(int mealFk) {
		this.mealFk = mealFk;
	}

	public int getRecipeFk() {
		return recipeFk;
	}

	public void setRecipeFk(int recipeFk) {
		this.recipeFk = recipeFk;
	}

	public char getStatus() {
		return status;
	}

	public void setStatus(char status) {
		this.status = status;
	}

	public Date getCreatedDate() {
		return createdDate;
	}

	public void setCreatedDate(Date createdDate) {
		this.createdDate = createdDate;
	}

	public int getCreatedBy() {
		return createdBy;
	}

	public void setCreatedBy(int createdBy) {
		this.createdBy = createdBy;
	}

	public Date getUpdatedDate() {
		return updatedDate;
	}

	public void setUpdatedDate(Date updatedDate) {
		this.updatedDate = updatedDate;
	}

	public int getUpdateBy() {
		return updateBy;
	}

	public void setUpdateBy(int updateBy) {
		this.updateBy = updateBy;
	}

	public static long getSerialversionuid() {
		return serialVersionUID;
	}

	@Column(name = "created_date")
	private Date createdDate;
 
	
	@Column(name = "created_by")
	private int createdBy;
 
	@Column(name = "update_date")
	private Date updatedDate;
 
	@Column(name = "update_by")
	private int updateBy;
 
}