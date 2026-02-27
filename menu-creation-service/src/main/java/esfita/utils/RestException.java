package esfita.utils;

/**
 * @author DHURAIMURUGAN A
 * @since 08 OCT 2025
 *
 *        Custom REST exception type.
 */
public class RestException extends RuntimeException {

	private static final long serialVersionUID = 5621993860252119284L;

	/** Must be final as suggested by Sonar */
	private final ErrorCodeDescription errorCodeDescription;

	/** HTTP / API status */
	private final Integer statusCode;

	/**
	 * Default constructor disabled to enforce meaningful exceptions.
	 */
	@SuppressWarnings("unused")
	private RestException() {
		this.errorCodeDescription = null;
		this.statusCode = null;
	}

	public RestException(Integer statusCode) {
		super();
		this.errorCodeDescription = null;
		this.statusCode = statusCode;
	}

	public RestException(String message) {
		super(message);
		this.errorCodeDescription = null;
		this.statusCode = null;
	}

	public RestException(ErrorCodeDescription errorCodeDescription) {
		super(errorCodeDescription != null ? errorCodeDescription.toString() : null);
		this.errorCodeDescription = errorCodeDescription;
		this.statusCode = null;
	}

	public RestException(ErrorCodeDescription errorCodeDescription, String message) {
		super(message);
		this.errorCodeDescription = errorCodeDescription;
		this.statusCode = null;
	}

	public RestException(ErrorDescription.Error errorDescription) {
		super();
		this.errorCodeDescription = null;
		this.statusCode = errorDescription != null ? errorDescription.getCode() : null;
	}

	public Integer getStatusCode() {
		return statusCode;
	}

	public ErrorCodeDescription getErrorCodeDescription() {
		return errorCodeDescription;
	}

	@Override
	public String toString() {
		return "RestException{" + "errorCodeDescription=" + errorCodeDescription + ", statusCode=" + statusCode
				+ ", message=" + getMessage() + '}';
	}
}
