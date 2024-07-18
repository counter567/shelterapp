<?php
class Shelterapp_Elementor_Widget extends \Elementor\Widget_Base {

	public function get_name() {
		return 'shelterapp_elementor_widget';
	}

	public function get_title() {
		return esc_html__( 'Shelterapp Elementor Widget', 'wordpress' );
	}

	public function get_icon() {
		return 'eicon-code';
	}

	public function get_categories() {
		return [ 'basic' ];
	}

	public function get_keywords() {
		return [ 'shelterapp', 'tiere', 'app' ];
	}

    protected function getOptionsAnimalType(){
        // get all terms of taxonomy animal_type
        $terms = get_terms( array(
            'taxonomy' => 'shelterapp_animal_type',
            'hide_empty' => false,
        ) );
        $termsOptions = array();
        foreach($terms as $term){
            $termsOptions[$term->term_id] = $term->name;
        }
        return $termsOptions;
    }

	protected function register_controls() {

		// Content Tab Start

		$this->start_controls_section(
			'section_settings',
			[
				'label' => esc_html__( 'Einstellungen', 'wordpress' ),
				'tab' => \Elementor\Controls_Manager::TAB_CONTENT,
			]
		);

        $this->add_control(
            'hideFilters',
            [
                'type' => \Elementor\Controls_Manager::SWITCHER,
                'label' => esc_html__( 'Verstecke Filter', 'wordpress' ),
                'label_on' => esc_html__( 'Ja', 'wordpress' ),
                'label_off' => esc_html__( 'Nein', 'wordpress' ),
                'default' => 'no',
            ]
        );
        $type_options = $this->getOptionsAnimalType();
        $type_ids = array_keys($type_options);
		$this->add_control(
			'type',
			[
				'type' => \Elementor\Controls_Manager::SELECT2,
                'multiple' => true,
				'label' => esc_html__( 'Type', 'wordpress' ),
				'options' => $type_options,
				'default' => $type_ids,
			]
		);

		$this->add_control(
			'status',
			[
				'type' => \Elementor\Controls_Manager::SELECT2,
				'label' => esc_html__( 'Status', 'wordpress' ),
                'multiple' => true,
				'options' => array(
                    'NEW' => esc_html__( 'Neu', 'wordpress' ),
                    'SEARCHING' => esc_html__( 'Suchend', 'wordpress' ),
                    'REQUEST_STOP' => esc_html__( 'Anfrage Stop', 'wordpress' ),
                    'EMERGENCY' => esc_html__( 'Notfall', 'wordpress' ),
                    'RESERVED' => esc_html__( 'Reserviert', 'wordpress' ),
                    'ADOPTED' => esc_html__( 'Adoptiert', 'wordpress' ),
                    'FINAL_CARE' => esc_html__( 'Final Care', 'wordpress' ),
                    'COURT_OF_GRACE' => esc_html__( 'Court Of Grace', 'wordpress' ),
                    'DECEASED' => esc_html__( 'Gestorben', 'wordpress' ),
                ),
				'default' => ['NEW', 'SEARCHING', 'REQUEST_STOP', 'EMERGENCY', 'RESERVED', 'ADOPTED', 'FINAL_CARE', 'COURT_OF_GRACE', 'DECEASED'],
			]
		);
		
		$this->add_control(
			'sex',
			[
				'type' => \Elementor\Controls_Manager::SELECT,
				'label' => esc_html__( 'Geschlecht', 'wordpress' ),
				'options' => array(
                    '' => esc_html__( 'Alle', 'wordpress' ),
                    'FEMALE' => esc_html__( 'Weiblich', 'wordpress' ),
                    'MALE' => esc_html__( 'Männlich', 'wordpress' ),
                    'DIV' => esc_html__( 'Diverse', 'wordpress' ),
                    'GROUP' => esc_html__( 'Gruppe', 'wordpress' )
                ),
				'default' => '0',
			]
		);

		$this->add_control(
			'minAge',
			[
				'type' => \Elementor\Controls_Manager::NUMBER,
				'label' => esc_html__( 'Mindestalter in Jahren', 'wordpress' ),
				'placeholder' => '0',
				'min' => 0,
				'max' => 100,
				'step' => 1,
				'default' => 0,
			]
		);
		$this->add_control(
			'maxAge',
			[
				'type' => \Elementor\Controls_Manager::NUMBER,
				'label' => esc_html__( 'Höchstalter in Jahren', 'wordpress' ),
				'placeholder' => '0',
				'min' => 0,
				'max' => 100,
				'step' => 1,
				'default' => 0,
			]
		);
        $this->add_control(
            'wasFound',
            [
                'type' => \Elementor\Controls_Manager::SELECT,
                'label' => esc_html__( 'Ist Fundtier', 'wordpress' ),
                'options' => array(
                    '' => esc_html__( 'Egal', 'wordpress' ),
                    'yes' => esc_html__( 'Ja', 'wordpress' ),
                    'no' => esc_html__( 'Nein', 'wordpress' ),
                            ),
                'default' => '',
            ]
        );
        $this->add_control(
            'missing',
            [
                'type' => \Elementor\Controls_Manager::SELECT,
                'label' => esc_html__( 'Wird vermisst', 'wordpress' ),
                'options' => array(
                    '' => esc_html__( 'Egal', 'wordpress' ),
                    'yes' => esc_html__( 'Ja', 'wordpress' ),
                    'no' => esc_html__( 'Nein', 'wordpress' ),
                            ),
                'default' => '',
            ]
        );
        $this->add_control(
            'privateAdoption',
            [
                'type' => \Elementor\Controls_Manager::SELECT,
                'label' => esc_html__( 'Ist Fremdvermittlung', 'wordpress' ),
                'options' => array(
                    '' => esc_html__( 'Egal', 'wordpress' ),
                    'yes' => esc_html__( 'Ja', 'wordpress' ),
                    'no' => esc_html__( 'Nein', 'wordpress' ),
                            ),
                'default' => '',
            ]
        );


        $this->end_controls_section();

		// Content Tab End
	}

	protected function render() {
		$settings = $this->get_settings_for_display();

		if(isset($settings['type']) && !empty($settings['type'])) $attributes['type'] = $settings['type'];
        if(isset($settings['status']) && !empty($settings['status'])) $attributes['status'] = $settings['status'];
        if(isset($settings['sex']) && !empty($settings['sex'])) $attributes['sex'] = $settings['sex'];
        if(isset($settings['minAge']) && !empty($settings['minAge'])) $attributes['minAge'] = $settings['minAge'];
        if(isset($settings['maxAge']) && !empty($settings['maxAge'])) $attributes['maxAge'] = $settings['maxAge'];
        if(isset($settings['wasFound']) && !empty($settings['wasFound'])) $attributes['wasFound'] = $settings['wasFound'];
        if(isset($settings['missing']) && !empty($settings['missing'])) $attributes['missing'] = $settings['missing'];
        if(isset($settings['privateAdoption']) && !empty($settings['privateAdoption'])) $attributes['privateAdoption'] = $settings['privateAdoption'];
        if(isset($settings['hideFilters']) && !empty($settings['hideFilters'])) $attributes['hideFilters'] = $settings['hideFilters'];
        include (plugin_dir_path(SHELTERAPP_PATH) . 'blocks/shelter-block-view/render.php');
	}

	protected function content_template() {
		?>
		<div style="padding:2rem; background: #ddd; color: black; font-weight: bold; margin: 0; text-align: center;">
			<h3>
				Shelterapp Elementor Widget
			</h3>
			<#
			if ( settings.type != 0 ) {
				#>
				<p>{{{ settings.type }}}</p>
				<#
			}
			#>
			<#
			if ( settings.status != 0 ) {
				#>
				<p>{{{ settings.status }}}</p>
				<#
			}
			#>
		</div>
		<?php
	}
}