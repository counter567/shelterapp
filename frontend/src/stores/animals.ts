import { makeObservable, observable, action, computed, makeAutoObservable } from "mobx"
import React, { ReactElement, ReactNode, createContext } from "react";
import { BehaviorSubject } from "rxjs";
import { createPortal } from "react-dom";
import { Animal } from "../models/animal";
import { AnimalStatus } from "../models/animalStatus";
import { PostFilter, getAnimal, getAnimalTypes, getAnimalsPaged } from "../service/animalapi";
import { AnimalSex } from "../models/animalSex";
import { animalSex, animalStatus } from "../components/AnimalList";

export const AuthInitialized = new BehaviorSubject<boolean>(false);

export interface AnimalFilter extends PostFilter {
    meta_status?: AnimalStatus;
    meta_sex?: AnimalSex;
    meta_age_max?: number;
    meta_age_min?: number;

    meta_was_found?: boolean;
    meta_missing?: boolean;
}
export interface AnimalFilterComputed extends PostFilter {
    meta_status?: AnimalStatus | AnimalStatus[];
    meta_sex?: AnimalSex | number;
}
export interface TypeData {
    id: number;
    name: string;
    count: number;
}

export class AnimalsStore {
    loading: boolean = false;
    animals: Animal[] = [];
    singleAnimal: Animal | null = null;
    currentPage = 1;
    maxPages = 1;
    postsPerPage = 10;
    filters: AnimalFilter = {};
    hideFilters = false;
    defaultTitle: string;

    typesData: TypeData[] = [];
    
    constructor() {
        this.defaultTitle = document.title;
        makeAutoObservable(this);
    }

    // Animals

    setAnimals(animals: Animal[]){
        this.animals = animals;
    }

    async fetchSingleAnimal(slug: string){
        const animal = await getAnimal(slug);
        if(animal) {
            this.setSingleAnimal(new Animal(animal));
        }
    }

    setSingleAnimal(animal: Animal){
        this.singleAnimal = animal;
    }

    async fetchCurrentAnimals(){
        this.loading = true;
        const res = await getAnimalsPaged(this.currentPage, this.postsPerPage, this.filterData);
        this.setAnimals(res?.map((animal) => new Animal(animal)) || []);
        this.setMaxPages(res?._pagination?.totalPages || 1);
        this.loading = false;
    }

    async fetchanimalByName(name: string){
        // @TODO
    }

    // Pagination

    setPage(page: number){
        if(page > this.maxPages || page < 1){
            return;
        }
        this.currentPage = page;
        this.fetchCurrentAnimals();
    }
    setMaxPages(maxPages: number){
        this.maxPages = maxPages;
    }
    setPostsPerPage(postsPerPage: number){
        this.postsPerPage = postsPerPage;
        this.fetchCurrentAnimals();
    }

    // Status

    fetchStatusData(){

    }

    setStatusData(){

    }

    // Types

    async fetchTypesData(){
        const typesStored = localStorage.getItem('sa.animal.types');
        if(typesStored !== null){
            this.setTypesData(JSON.parse(typesStored), false);
        }
        const types = await getAnimalTypes();
        this.setTypesData(types);
    }

    setTypesData(typeData: TypeData[], store = true){
        this.typesData = typeData.filter(e => e.count > 0);
        if(store) {
            localStorage.setItem('sa.animal.types', JSON.stringify(typeData));
        }
    }

    // Filter
    
    get filterData(){
        const filters: AnimalFilterComputed = {
            ... this.filters as any,
        }

        // fill meta_status
        if (this.filters.meta_status){
            filters.meta_status = this.filters.meta_status as AnimalStatus;
        } else {
            filters.meta_status = [AnimalStatus.New, AnimalStatus.Searching, AnimalStatus.RequestStop, AnimalStatus.Emergency, AnimalStatus.Reserved, AnimalStatus.FinalCare, AnimalStatus.CourtOfGrace]
        }
        

        return filters;
    }

    setFilter<T extends keyof AnimalFilter>(filter: T, value: AnimalFilter[T], store = true){
        // console.log('setFilter', filter, value);
        if(value === undefined){
            delete this.filters[filter];
        } else {
            this.filters[filter] = value;
        }
        if(store) {
            this.fetchCurrentAnimals();
            if(!this.hideFilters) {
                const url = new URL(window.location as any);
                url.hash = '#' + Object.keys(this.filters).filter(c => !!c).map(c => `${c}=${(this.filters as any)[c]}`).join('&');
                window.history.pushState({}, '', url.toString());
            }
        }
    }

    loadFiltersFromURL(){
        if(!this.hideFilters) {
            const hash = new URL(window.location as any).hash;
            hash.slice(1).split('&').forEach(c => {
                let [propName, value] = c.split('=') as [string, any];
                if(propName === 'shelterapp_animal_type' || propName === 'meta_age_max' || propName === 'meta_age_min') {
                  value = Number.isInteger(parseInt(value)) ? parseInt(value) : value;
                }
                (this.filters as any)[propName] = value;
            });
        }
    }

    resetFilter(){
        this.filters = {};
    }

    setHideFilters(hideFilters: boolean){
        this.hideFilters = hideFilters;
    }

    // Title

    get title(){
        let newTitle = this.defaultTitle;

        if(this.filters.shelterapp_animal_type) {
            const value = this.typesData.find((animal) => animal.id === this.filters.shelterapp_animal_type)?.name || undefined;
            if(value) {
                newTitle += ` - ${value}`;
            }
        }
        if(this.filters.meta_sex) {
            const entry = animalSex.find(e => e.id == this.filters.meta_sex);
            if(entry) {
                newTitle += ` - ${entry?.name}`;
            }
        }
        if(this.filters.meta_status) {
            const entry = animalStatus.find(e => e.id === this.filters.meta_status);
            if(entry) {
                newTitle += ` - ${entry?.name}`;
            }
        }
        /*
        if (propName === "status" && value !== 0) {
            const entry = animalStatus.filter(e => e.id === value).pop();
            if(entry) {
            newTitle += ` - ${entry?.name}`;
            }
        }
        */
        return newTitle;
    }

}

export const AnimalsStoreInstance = new AnimalsStore();
export const AnimalsStoreContext = createContext(
    AnimalsStoreInstance
);
export default AnimalsStoreContext;
