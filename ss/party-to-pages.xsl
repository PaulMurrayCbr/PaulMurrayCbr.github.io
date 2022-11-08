<?xml version="1.0" encoding="UTF-8"?>

<xsl:stylesheet version="1.0"
	xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

	<xsl:template match="/">
		<xsl:for-each select="/document/public//character">
			<div class="menupage characterpage" style="display: none;">
				<xsl:attribute name="data-menupage"><xsl:value-of
					select="@name" /></xsl:attribute>

				<div class="namerace">
					<h2>
						<xsl:value-of select="@name" />
					</h2>

					<xsl:for-each select="types/type">
						<xsl:text> </xsl:text>
						<xsl:value-of select="@name" />
					</xsl:for-each>
					<xsl:for-each select="subtypes/subtype">
						<xsl:text> (</xsl:text>
						<xsl:value-of select="@name" />
						<xsl:text>)</xsl:text>
					</xsl:for-each>
					<xsl:text> </xsl:text>
					<xsl:value-of select="alignment/@name" />
				</div>

				<xsl:for-each select="classes/class">
					<div class="classsummary">
						<xsl:text> </xsl:text>
						<xsl:value-of select="@name" />
						<xsl:text> </xsl:text>
						<xsl:value-of select="@level" />
						<xsl:text> </xsl:text>
						<xsl:if test="@casterlevel and @casterlevel > 0">
							<div class="castersummary">
								<xsl:text> </xsl:text>
								<xsl:value-of select="@spells" />
								<xsl:text> </xsl:text>
								<xsl:value-of select="@castersource" />
								<xsl:text> Lvl </xsl:text>
								<xsl:value-of select="@casterlevel" />
								<xsl:text>, DC </xsl:text>
								<xsl:value-of select="@basespelldc" />
								<xsl:text>, Conc </xsl:text>
								<xsl:value-of select="@concentrationcheck" />
								<xsl:text>, </xsl:text>
								<xsl:value-of select="@overcomespellresistance" />
								<xsl:text> vs SR </xsl:text>
							</div>
						</xsl:if>
					</div>
				</xsl:for-each>

				<div class="init">
					<div class="summary">
						<span>
							<strong>Init: </strong>
							<xsl:value-of select="initiative/@total" />
						</span>
					</div>
					<div>
						<xsl:value-of select="initiative/@attrname" />
						<span>
							:
						</span>
						<xsl:value-of select="initiative/@attrtext" />
						, Misc:
						<xsl:value-of select="initiative/@misctext" />
					</div>
					<xsl:for-each select="initiative">
						<xsl:call-template
							name="do-situational-modifiers" />
					</xsl:for-each>
				</div>

				<div class="health">
					<span class="hp">

						<strong>
							HP:
							<xsl:value-of select="health/@hitpoints" />
						</strong>
						<span>
							(
							<xsl:value-of select="health/@hitdice" />
							)
						</span>
					</span>
				</div>

				<div class="ac">
					<div class="summary">
						<span>
							<strong>AC: </strong>
							<xsl:value-of select="armorclass/@ac" />
							<strong>, touch: </strong>
							<xsl:value-of select="armorclass/@ac" />
							<strong>, flatfooted: </strong>
							<xsl:value-of select="armorclass/@ac" />
						</span>
					</div>

					<div>
						Armour
						<xsl:value-of select="armorclass/@fromarmor" />
						<xsl:if test="string-length(armorclass/@fromshield)>0">
							, Sheild
							<xsl:value-of select="armorclass/@fromshield" />
						</xsl:if>
						<xsl:if test="string-length(armorclass/@fromdexterity)>0">
							, Dex
							<xsl:value-of select="armorclass/@fromdexterity" />
						</xsl:if>
						<xsl:if test="string-length(armorclass/@fromwisdom)>0">
							, Wis
							<xsl:value-of select="armorclass/@fromwisdom" />
						</xsl:if>
						<xsl:if test="string-length(armorclass/@fromscharisma)>0">
							, Cha
							<xsl:value-of select="armorclass/@fromcharisma" />
						</xsl:if>
						<xsl:if test="string-length(armorclass/@fromsize)>0">
							, Size
							<xsl:value-of select="armorclass/@fromsize" />
						</xsl:if>
						<xsl:if test="string-length(armorclass/@fromnatural)>0">
							, Natural
							<xsl:value-of select="armorclass/@fromnatural" />
						</xsl:if>
						<xsl:if test="string-length(armorclass/@fromdeflect)>0">
							, Deflection
							<xsl:value-of select="armorclass/@fromdeflect" />
						</xsl:if>
						<xsl:if test="string-length(armorclass/@fromdodge)>0">
							, Dodge
							<xsl:value-of select="armorclass/@fromdodge" />
						</xsl:if>
						<xsl:if test="string-length(armorclass/@frommisc)>0">
							, Misc
							<xsl:value-of select="armorclass/@frommisc" />
						</xsl:if>

						<xsl:for-each select="penalties/penalty">
							<xsl:text>, </xsl:text>
							<xsl:value-of select="@name" />
							<xsl:text> </xsl:text>
							<xsl:value-of select="@text" />
						</xsl:for-each>
						<xsl:for-each select="armorclass">
							<xsl:call-template
								name="do-situational-modifiers" />
						</xsl:for-each>

					</div>
				</div>


				<xsl:if test="senses/special">
					<h3>Senses</h3>
					<xsl:for-each select="senses/special">
						<div>
							<div class="has-description">
								<xsl:value-of select="@name" />
							</div>
							<xsl:call-template name="has-description" />
						</div>
					</xsl:for-each>
				</xsl:if>


				<h3>Stats</h3>

				<table class="stats">
					<xsl:for-each select="attributes/attribute">
						<tr>
							<td>
								<xsl:value-of select="@name" />
							</td>
							<td>
								<xsl:value-of select="attrvalue/@text" />
							</td>
							<td>
								(
								<xsl:value-of select="attrbonus/@text" />
								)
							</td>
						</tr>
						<tr>
							<td colspan="3">
								<xsl:call-template
									name="do-situational-modifiers" />
							</td>
						</tr>
					</xsl:for-each>

				</table>

				<h3>Saves</h3>

				<table class="saves">
					<tr>
						<th></th>
						<th></th>
						<th></th>
						<th>base</th>
						<th>attr</th>
						<th>resist</th>
						<th>misc</th>
					</tr>
					<xsl:for-each select="saves/save">
						<tr>
							<td>
								<xsl:value-of select="@abbr" />
							</td>
							<td>
								<xsl:value-of select="@save" />
							</td>
							<td>
								<xsl:text>=</xsl:text>
							</td>
							<td>
								<xsl:value-of select="@base" />
							</td>
							<td>
								<xsl:value-of select="@fromattr" />
							</td>
							<td>
								<xsl:value-of select="@fromresist" />
							</td>
							<td>
								<xsl:value-of select="@frommisc" />
							</td>
						</tr>
						<tr>
							<td colspan="7">
								<xsl:call-template
									name="do-situational-modifiers" />
							</td>
						</tr>
					</xsl:for-each>

				</table>

				<h3>Other Defenses</h3>
				<xsl:for-each select="defensive/special">
					<div>
						<xsl:value-of select="@name" />
						<xsl:text> (</xsl:text>
						<xsl:value-of select="@sourcetext" />
						<xsl:text>)</xsl:text>
					</div>
				</xsl:for-each>
				<xsl:for-each select="damagereduction[*|text()]">
					damagereduction TODO!
				</xsl:for-each>
				<xsl:for-each select="immunities[*|text()]">
					immunities TODO!
				</xsl:for-each>
				<xsl:for-each select="weaknesses[*|text()]">
					weaknesses TODO!
				</xsl:for-each>

				<h3>Combat Maneuvers</h3>
				<strong>CMB: </strong>
				<xsl:value-of select="maneuvers/@cmb" />
				<strong>, CMD: </strong>
				<xsl:value-of select="maneuvers/@cmd" />
				<strong>, (flat-footed): </strong>
				<xsl:value-of select="maneuvers/@cmdflatfooted" />


				<h3>Attacks</h3>
				<div class='attacks'>
					<xsl:for-each select="attack[@*|*|text()]">
						<div class="attack">
							<span>
								Attack bonus:
								<xsl:value-of select="@attackbonus" />
							</span>
							<span>
								Melee:
								<xsl:value-of select="@meleeattack" />
							</span>
							<span>
								Ranged:
								<xsl:value-of select="@rangedattack" />
							</span>
							<span>
								Base attack:
								<xsl:value-of select="@baseattack" />
							</span>
							<xsl:for-each select="special[@*|*|text()]">
								<div>
									Special:
									<xsl:value-of select="@name" />
									(<xsl:value-of select="@sourcetext" />)
									<xsl:call-template name="has-description"></xsl:call-template>
								</div>
							</xsl:for-each>
						</div>
					</xsl:for-each>


					<xsl:for-each select="melee[@*|*|text()]">
						<div class="melee">
							Melee:
							<xsl:for-each select="weapon[@*|*|text()]">
								<xsl:call-template name="do-weapon" />
							</xsl:for-each>
						</div>
					</xsl:for-each>
					<xsl:for-each select="ranged[@*|*|text()]">
						<div class="ranged">
						Ranged:
							<xsl:for-each select="weapon[@*|*|text()]">
								<xsl:call-template name="do-weapon" />
							</xsl:for-each>
						</div>
					</xsl:for-each>

				</div>
				<div class="skills">
				<h3>Skills</h3>
				
					<xsl:for-each select="skillabilities/special">
						<div>
							<div class="has-description">
								<xsl:value-of select="@name" />
							</div>
							<xsl:call-template name="has-description" />
						</div>
					</xsl:for-each>
				
				<table>
				<tr>
<td></td>
<td></td>
<td>ranks</td>
<td>class</td>
<td colspan="2">attr</td>
<td>armour
<xsl:value-of select='penalties/penalty[@name="Armor Check Penalty"]/@value'/>
</td>
</tr>
<xsl:for-each select="skills/skill">
<tr>
<td><xsl:value-of select="@name"/> </td>
<td style="text-align: right;"><xsl:value-of select="@value"/></td>
<td style="text-align: right;"><xsl:value-of select="@ranks"/></td>
<td style="text-align: center;"><xsl:if test="@classskill='yes'">*</xsl:if></td>
<td><xsl:value-of select="@attrname"/></td>
<td style="text-align: right;"><xsl:value-of select="@attrbonus"/> </td>
<td  style="text-align: center;"><xsl:if test="@armorcheck='yes'"><B>!</B></xsl:if></td>
</tr>
</xsl:for-each>

				</table>
					<xsl:for-each select="skills/skill"></xsl:for-each>				
				</div>
				
				<xsl:if test="skilltricks/*">
				<h3>Skill Tricks</h3>
				TODO
				</xsl:if>
				
				<xsl:if test="animaltricks/*">
				<h3>Animal Tricks</h3>
				<xsl:for-each select="animaltricks/animaltrick">
				<div class="animaltrick">
				<xsl:value-of select="@name"/>
				<xsl:call-template name="has-description"/>
				</div>
				</xsl:for-each>
				</xsl:if>

				<h3>Feats</h3>
				<xsl:for-each select="feats/feat">
				<div class="feat">
				<xsl:value-of select="@name"/>
				(<xsl:value-of select="@categorytext"/>)
				<xsl:call-template name="has-description"/>
				</div>
				</xsl:for-each>
				<h3>Spells</h3>
TODO
				<h3>Magic Items</h3>
TODO
				<h3>Gear</h3>
TODO
				<div class="legal">
					<xsl:copy-of
						select="/document/public/program/programinfo/text()" />
				</div>
			</div>
		</xsl:for-each>
	</xsl:template>

	<xsl:template name="do-weapon">
		<div class="weapon">
			<span>
				<xsl:value-of select="@name" />
			</span>
			-
			<span>
				<xsl:value-of select="@categorytext" />
			</span>
			<span>(<xsl:value-of select="weptype" />)</span>
			<span>
				<xsl:value-of select="@attack" />
			</span>
			<span>
				(<xsl:value-of select="@crit" />)
			</span>
			<span>
				<xsl:value-of select="@damage" />
			</span>
			<xsl:call-template name="do-situational-modifiers"></xsl:call-template>
			<xsl:call-template name="has-description"></xsl:call-template>
		</div>

	</xsl:template>

	<xsl:template name="do-situational-modifiers">
		<xsl:for-each select="situationalmodifiers">
			<xsl:choose>
				<xsl:when test="situationalmodifier">
					<xsl:for-each select="situationalmodifier">
						<div class="situational-modifier">
							<strong>
								<xsl:value-of select="@source" />
								<xsl:text>: </xsl:text>
							</strong>
							<xsl:value-of select="@text" />
						</div>
					</xsl:for-each>
				</xsl:when>
				<xsl:otherwise>
					<div class="situational-modifier">
						<xsl:value-of select="@text" />
					</div>
				</xsl:otherwise>
			</xsl:choose>
		</xsl:for-each>
	</xsl:template>

	<xsl:template name="has-description">
		<xsl:for-each select="description">
			<div class="description">
				<xsl:value-of select="." />
			</div>
		</xsl:for-each>
	</xsl:template>

</xsl:stylesheet> 