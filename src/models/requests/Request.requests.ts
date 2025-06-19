export interface CreateRequestRegistrationReqBody {
  citizen_id_number: string
  blood_group_id: string
  blood_component_id: string
  receive_date_request: Date
  is_emergency: boolean
  image?: string
  full_name?: string
  phone?: string
}
