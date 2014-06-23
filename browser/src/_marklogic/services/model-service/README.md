# mlModel Service

## Purpose

mlModelService is to assist in managing model elements within the Angular MVC paradigm.

Things it can do:

* maintain JSON schema for model elements
* allow association of specific model objects with JSON schema
* determine and mark the validity (is valid, or which errors are present) of model elements at the property/primitive level (within the bounds of what can be accomplished client-side).  For starters, it will run them through associated (or ad hoc-provided) JSON schema. Custom validation beyond that level may involve functional code
* expose validity within the model hierarchy for use by the mlModel directive

