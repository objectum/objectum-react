/* eslint-disable no-whitespace-before-property */
/* eslint-disable eqeqeq */

export default function RadioField ({property, records, value, onChange}) {
	let name = Math.random ();

	console.log (value);
	return <div className="mr-2">
		{records.map ((record, i) => {
			return <div key={i} className="form-check">
				<input className="form-check-input" type="radio" name={name} value={record.id} checked={value == record.id} onChange={() => {
					onChange ({value: record.id, code: property, property});
				}} />
				<label className="form-check-label">{record.getLabel ? record.getLabel () : record.name}</label>
			</div>;
		})}
	</div>;
}
