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
@Table(name = "meal_set_template_d", schema = "dbo")
public class MealSetTemplateDHib implements Serializable {

	/**
	 * 
	 */
	private static final long serialVersionUID = -3361698877048645804L;

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "id", updatable = false)
	private int id;

	@Column(name = "template_fk")
	private int templateFk;

	@Column(name = "category_fk")
	private int categoryFk;

	@Column(name = "category_name") // Optional if redundant
	private String categoryName;

	@Column(name = "recipes_required")
	private int recipesRequired;

	@Column(name = "status")
	private char status;

	@Column(name = "created_by")
	private int createdBy;

	@Column(name = "created_date_time")
	private Date createdDateTime;

	@Column(name = "last_act_by")
	private int lastActBy;

	@Column(name = "last_act_date_time")
	private Date lastActDateTime;

	public int getId() {
		return id;
	}

	public void setId(int id) {
		this.id = id;
	}

	public int getTemplateFk() {
		return templateFk;
	}

	public void setTemplateFk(int templateFk) {
		this.templateFk = templateFk;
	}

	public int getCategoryFk() {
		return categoryFk;
	}

	public void setCategoryFk(int categoryFk) {
		this.categoryFk = categoryFk;
	}

	public String getCategoryName() {
		return categoryName;
	}

	public void setCategoryName(String categoryName) {
		this.categoryName = categoryName;
	}

	public int getRecipesRequired() {
		return recipesRequired;
	}

	public void setRecipesRequired(int recipesRequired) {
		this.recipesRequired = recipesRequired;
	}

	public char getStatus() {
		return status;
	}

	public void setStatus(char status) {
		this.status = status;
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
}
