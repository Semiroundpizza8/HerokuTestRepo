import React from "react";
import "./Users.css"
import {Avatar} from '@material-ui/core';
const Users = (props) => {
const { usersList } = props;

	return (
		<>
			<h1 className="productsHeader">All Users</h1>
			<div className="users">
				{usersList.map((users) => {
					const {
						id,
						firstName,
						lastName,
						email,
						imageURL,
						username,
						isAdmin,
					} = users;
					return (
						<div id="modal" className="usersCard" key={id}>
							<p>
								<Avatar
									alt="avatar"
									src={imageURL}
								>
									{firstName.charAt(0) +
										" " +
										lastName.charAt(0)}
								</Avatar>
							</p>
							<p>Id: {id}</p>
							<p>First Name: {firstName}</p>
							<p>Last Name: {lastName}</p>
							<p>Email: {email}</p>
							<p>User Name: {username}</p>
							<p>Administrator: {isAdmin}</p>
						</div>
					);
				})}
			</div>
		</>
	);
};

export default Users;