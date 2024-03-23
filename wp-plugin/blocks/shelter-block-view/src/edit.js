/**
 * Retrieves the translation of text.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/packages/packages-i18n/
 */
import { __ } from '@wordpress/i18n';

/**
 * React hook that is used to mark the block wrapper element.
 * It provides all the necessary props like the class name.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/packages/packages-block-editor/#useblockprops
 */
import { useBlockProps } from '@wordpress/block-editor';
import { useSelect } from '@wordpress/data';
import { store as coreDataStore } from '@wordpress/core-data';

/**
 * Lets webpack process CSS, SASS or SCSS files referenced in JavaScript files.
 * Those files can contain any CSS code that gets applied to the editor.
 *
 * @see https://www.npmjs.com/package/@wordpress/scripts#using-css
 */
import './editor.scss';

const options = [
	'dog',
	'cat',
]

/**
 * The edit function describes the structure of your block in the context of the
 * editor. This represents what the editor will render when the block is used.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/block-api/block-edit-save/#edit
 *
 * @return {Element} Element to render.
 */
export default function Edit({ attributes, setAttributes, isSelected }) {
	const { type } = attributes;
	const onSetType = (ev) => {
		setAttributes({ type: ev.nativeEvent.target.value });
	}

	const types = useSelect(
		select =>
			select(coreDataStore).getEntityRecords('taxonomy', 'shelterapp_animal_type'),
		[]
	);

	return (
		<div {...useBlockProps()}>
			<p>
				{__(
					'Shelter Block View',
					'shelter-block-view'
				)}
			</p>

			<div class="option-row">
				<span>{__('Type')}</span>
				{types && <select defaultValue={type} onChange={onSetType}>
					<option value={''}>{__('All')}</option>
					{types.map((typeOption) => {
						return <option value={typeOption.id}>{__(typeOption.name)}</option>;
					})}
				</select>}

			</div>
		</div>
	);
}
